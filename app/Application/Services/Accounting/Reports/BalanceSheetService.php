<?php

namespace App\Application\Services\Accounting\Reports;

use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;

class BalanceSheetService
{
    /**
     * Get Balance Sheet as of a specific date
     */
    public function getBalanceSheet(?string $asOfDate = null): array
    {
        $asOfDate = $asOfDate ?? now()->format('Y-m-d');

        // Get all accounts grouped by type
        $assets = $this->getAccountsByType(['asset'], $asOfDate);
        $liabilities = $this->getAccountsByType(['liability'], $asOfDate);
        $equity = $this->getAccountsByType(['equity'], $asOfDate);

        // Calculate totals
        $totalAssets = collect($assets)->sum('balance');
        $totalLiabilities = collect($liabilities)->sum('balance');
        $totalEquity = collect($equity)->sum('balance');

        return [
            'as_of_date' => $asOfDate,
            'assets' => [
                'current' => collect($assets)->filter(fn ($a) => str_starts_with($a['account_code'], '11'))->values()->toArray(),
                'non_current' => collect($assets)->filter(fn ($a) => ! str_starts_with($a['account_code'], '11'))->values()->toArray(),
                'total' => $totalAssets,
            ],
            'liabilities' => [
                'current' => collect($liabilities)->filter(fn ($l) => str_starts_with($l['account_code'], '21'))->values()->toArray(),
                'non_current' => collect($liabilities)->filter(fn ($l) => ! str_starts_with($l['account_code'], '21'))->values()->toArray(),
                'total' => $totalLiabilities,
            ],
            'equity' => [
                'items' => $equity,
                'total' => $totalEquity,
            ],
            'total_liabilities_and_equity' => $totalLiabilities + $totalEquity,
            'is_balanced' => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
            'working_capital' => $this->calculateWorkingCapital($assets, $liabilities),
        ];
    }

    /**
     * Get comparative balance sheet
     */
    public function getComparativeBalanceSheet(string $date1, string $date2, ?string $date3 = null): array
    {
        $bs1 = $this->getBalanceSheet($date1);
        $bs2 = $this->getBalanceSheet($date2);
        $bs3 = $date3 ? $this->getBalanceSheet($date3) : null;

        return [
            'dates' => array_filter([$date1, $date2, $date3]),
            'periods' => array_filter([$bs1, $bs2, $bs3]),
        ];
    }

    /**
     * Get accounts by type(s) with balances
     */
    private function getAccountsByType(array $types, string $asOfDate): array
    {
        $accounts = ChartOfAccount::whereIn('type', $types)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return $accounts->map(function ($account) use ($asOfDate) {
            $balance = $this->calculateAccountBalance($account, $asOfDate);

            return [
                'account_id' => $account->id,
                'account_code' => $account->code,
                'account_name' => $account->name,
                'balance' => $balance,
            ];
        })->filter(fn ($account) => abs($account['balance']) >= 0.01)->values()->toArray();
    }

    /**
     * Calculate account balance
     */
    private function calculateAccountBalance(ChartOfAccount $account, string $asOfDate): float
    {
        $lines = JournalEntryLine::where('chart_of_account_id', $account->id)
            ->whereHas('journalEntry', function ($q) use ($asOfDate) {
                $q->where('status', 'posted')
                    ->where('date', '<=', $asOfDate);
            })
            ->get();

        $debit = $lines->sum('debit');
        $credit = $lines->sum('credit');

        // For balance sheet, return net balance
        if (in_array($account->type, ['asset', 'expense'])) {
            return $debit - $credit;
        } else {
            return $credit - $debit;
        }
    }

    /**
     * Calculate working capital
     */
    private function calculateWorkingCapital(array $assets, array $liabilities): float
    {
        $currentAssets = collect($assets)->filter(fn ($a) => str_starts_with($a['account_code'], '11'))->sum('balance');
        $currentLiabilities = collect($liabilities)->filter(fn ($l) => str_starts_with($l['account_code'], '21'))->sum('balance');

        return $currentAssets - $currentLiabilities;
    }
}
