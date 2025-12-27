<?php

namespace App\Application\Services\Accounting\Reports;

use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;

class TrialBalanceService
{
    /**
     * Get Trial Balance as of a specific date
     */
    public function getTrialBalance(?string $asOfDate = null, ?int $periodId = null): array
    {
        $asOfDate = $asOfDate ?? now()->format('Y-m-d');

        // Get all active accounts
        $accounts = ChartOfAccount::where('is_active', true)
            ->orderBy('code')
            ->get();

        $balances = [];
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($accounts as $account) {
            $balance = $this->calculateAccountBalance($account->id, $asOfDate);

            if ($balance['debit'] != 0 || $balance['credit'] != 0) {
                $balances[] = [
                    'account_id' => $account->id,
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'account_type' => $account->type,
                    'debit' => $balance['debit'],
                    'credit' => $balance['credit'],
                ];

                $totalDebit += $balance['debit'];
                $totalCredit += $balance['credit'];
            }
        }

        return [
            'as_of_date' => $asOfDate,
            'accounts' => $balances,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
            'difference' => $totalDebit - $totalCredit,
        ];
    }

    /**
     * Get comparative trial balance
     */
    public function getComparativeTrialBalance(string $date1, string $date2, ?string $date3 = null): array
    {
        $tb1 = $this->getTrialBalance($date1);
        $tb2 = $this->getTrialBalance($date2);
        $tb3 = $date3 ? $this->getTrialBalance($date3) : null;

        // Merge accounts from all periods
        $allAccounts = collect($tb1['accounts'])
            ->concat($tb2['accounts'])
            ->when($tb3, fn ($collection) => $collection->concat($tb3['accounts']))
            ->unique('account_id')
            ->sortBy('account_code')
            ->values();

        $comparativeData = $allAccounts->map(function ($account) use ($tb1, $tb2, $tb3) {
            $findBalance = function ($tb, $accountId) {
                $account = collect($tb['accounts'])->firstWhere('account_id', $accountId);

                return $account ?? ['debit' => 0, 'credit' => 0];
            };

            $balance1 = $findBalance($tb1, $account['account_id']);
            $balance2 = $findBalance($tb2, $account['account_id']);
            $balance3 = $tb3 ? $findBalance($tb3, $account['account_id']) : null;

            return [
                'account_id' => $account['account_id'],
                'account_code' => $account['account_code'],
                'account_name' => $account['account_name'],
                'account_type' => $account['account_type'],
                'period1' => $balance1,
                'period2' => $balance2,
                'period3' => $balance3,
            ];
        });

        return [
            'dates' => array_filter([$date1, $date2, $date3]),
            'accounts' => $comparativeData->toArray(),
            'totals' => [
                'period1' => ['debit' => $tb1['total_debit'], 'credit' => $tb1['total_credit']],
                'period2' => ['debit' => $tb2['total_debit'], 'credit' => $tb2['total_credit']],
                'period3' => $tb3 ? ['debit' => $tb3['total_debit'], 'credit' => $tb3['total_credit']] : null,
            ],
        ];
    }

    /**
     * Calculate account balance as of a specific date
     */
    private function calculateAccountBalance(int $accountId, string $asOfDate): array
    {
        $account = ChartOfAccount::find($accountId);
        if (! $account) {
            return ['debit' => 0, 'credit' => 0];
        }

        $lines = JournalEntryLine::where('chart_of_account_id', $accountId)
            ->whereHas('journalEntry', function ($q) use ($asOfDate) {
                $q->where('status', 'posted')
                    ->where('date', '<=', $asOfDate);
            })
            ->get();

        $totalDebit = $lines->sum('debit');
        $totalCredit = $lines->sum('credit');

        // Determine normal balance based on account type
        if (in_array($account->type, ['asset', 'expense'])) {
            // Debit balance accounts
            $netBalance = $totalDebit - $totalCredit;

            return [
                'debit' => max(0, $netBalance),
                'credit' => max(0, -$netBalance),
            ];
        } else {
            // Credit balance accounts (liability, equity, revenue)
            $netBalance = $totalCredit - $totalDebit;

            return [
                'debit' => max(0, -$netBalance),
                'credit' => max(0, $netBalance),
            ];
        }
    }
}
