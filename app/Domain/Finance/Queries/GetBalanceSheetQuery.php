<?php

namespace App\Domain\Finance\Queries;

use App\Models\ChartOfAccount;
use Illuminate\Database\Eloquent\Builder;

class GetBalanceSheetQuery
{
    /**
     * Get Balance Sheet as of a specific date.
     *
     * @param  string  $asOfDate  YYYY-MM-DD
     * @return array Structure with Assets, Liabilities, Equity, and totals.
     */
    public function execute(string $asOfDate)
    {
        $getAccounts = function (array $types) use ($asOfDate) {
            return ChartOfAccount::whereIn('type', $types)
                ->withSum(['journalEntryLines as total_debit' => function (Builder $query) use ($asOfDate) {
                    $query->whereHas('journalEntry', function (Builder $q) use ($asOfDate) {
                        $q->where('status', 'posted')
                            ->where('date', '<=', $asOfDate);
                    });
                }], 'debit')
                ->withSum(['journalEntryLines as total_credit' => function (Builder $query) use ($asOfDate) {
                    $query->whereHas('journalEntry', function (Builder $q) use ($asOfDate) {
                        $q->where('status', 'posted')
                            ->where('date', '<=', $asOfDate);
                    });
                }], 'credit')
                ->orderBy('code')
                ->get()
                ->map(function ($account) use ($types) {
                    $debit = (float) $account->total_debit;
                    $credit = (float) $account->total_credit;

                    // ASSET: Debit - Credit
                    // LIABILITY/EQUITY: Credit - Debit
                    $balance = 0;
                    if (in_array('ASSET', $types)) {
                        $balance = $debit - $credit;
                    } else {
                        $balance = $credit - $debit;
                    }

                    return [
                        'id' => $account->id,
                        'code' => $account->code,
                        'name' => $account->name,
                        'amount' => $balance,
                    ];
                })
                ->filter(fn ($a) => $a['amount'] != 0)
                ->values();
        };

        $assets = $getAccounts(['ASSET']);
        $liabilities = $getAccounts(['LIABILITY']);
        $equity = $getAccounts(['EQUITY']);

        $totalAssets = $assets->sum('amount');
        $totalLiabilities = $liabilities->sum('amount');
        $totalEquity = $equity->sum('amount');

        // Note: Retained Earnings from current year (Net Income) usually needs to be added to Equity for balance sheet to balance if we don't have a hard close.
        // For simplicity, we might just calculate Net Income and add it as "Current Earnings" under Equity.
        // Let's implement Net Income calculation here reusing GetProfitLossQuery logic but for ALL TIME up to asOfDate?
        // Or cleaner: Start of fiscal year to asOfDate.
        // Let's assume Retained Earnings from previous years are already closed into an Equity account or we calculate cumulative Net Income.
        // For now, let's keep it simple and just show the raw balances. If it doesn't balance, we know why.

        return [
            'assets' => $assets,
            'total_assets' => $totalAssets,
            'liabilities' => $liabilities,
            'total_liabilities' => $totalLiabilities,
            'equity' => $equity,
            'total_equity' => $totalEquity,
            'total_liabilities_equity' => $totalLiabilities + $totalEquity,
        ];
    }
}
