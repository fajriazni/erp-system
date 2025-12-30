<?php

namespace App\Application\Services\Accounting\Reports;

use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;
use Illuminate\Support\Collection;

class GeneralLedgerService
{
    /**
     * Get General Ledger report for specific account(s)
     */
    public function getGeneralLedger(
        ?int $accountId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?int $periodId = null
    ): array {
        $query = JournalEntryLine::with(['journalEntry', 'chartOfAccount'])
            ->whereHas('journalEntry', function ($q) {
                $q->where('status', 'posted');
            });

        // Filter by account
        if ($accountId) {
            $query->where('chart_of_account_id', $accountId);
        }

        // Filter by date range
        if ($startDate && $endDate) {
            $query->whereHas('journalEntry', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate]);
            });
        }

        $lines = $query->orderBy('created_at')->get();

        // Group by account and calculate running balance
        $groupedData = $lines->groupBy('chart_of_account_id')->map(function ($accountLines, $accountId) use ($startDate) {
            $account = $accountLines->first()->chartOfAccount;

            // Calculate beginning balance
            $beginningBalance = $this->calculateBeginningBalance($accountId, $startDate);

            $runningBalance = $beginningBalance;
            $movements = $accountLines->map(function ($line) use (&$runningBalance, $account) {
                $debit = (float) $line->debit;
                $credit = (float) $line->credit;

                // Calculate running balance based on account type
                if (in_array($account->type, ['asset', 'expense'])) {
                    // Debit increases, Credit decreases
                    $runningBalance += $debit - $credit;
                } else {
                    // Credit increases, Debit decreases
                    $runningBalance += $credit - $debit;
                }

                return [
                    'date' => $line->journalEntry->date->format('Y-m-d'),
                    'journal_entry_id' => $line->journal_entry_id,
                    'reference_number' => $line->journalEntry->reference_number,
                    'description' => $line->description ?? $line->journalEntry->description,
                    'debit' => $debit,
                    'credit' => $credit,
                    'balance' => $runningBalance,
                ];
            });

            return [
                'account_id' => $accountId,
                'account_code' => $account->code,
                'account_name' => $account->name,
                'account_type' => $account->type,
                'beginning_balance' => $beginningBalance,
                'movements' => $movements->toArray(),
                'ending_balance' => $runningBalance,
                'total_debit' => $accountLines->sum('debit'),
                'total_credit' => $accountLines->sum('credit'),
            ];
        });

        return $groupedData->values()->toArray();
    }

    /**
     * Calculate beginning balance for an account as of a date
     */
    private function calculateBeginningBalance(int $accountId, ?string $asOfDate = null): float
    {
        if (! $asOfDate) {
            return 0;
        }

        $account = ChartOfAccount::find($accountId);
        if (! $account) {
            return 0;
        }

        $balance = JournalEntryLine::where('chart_of_account_id', $accountId)
            ->whereHas('journalEntry', function ($q) use ($asOfDate) {
                $q->where('status', 'posted')
                    ->where('date', '<', $asOfDate);
            })
            ->get()
            ->reduce(function ($carry, $line) use ($account) {
                $debit = (float) $line->debit;
                $credit = (float) $line->credit;

                if (in_array($account->type, ['asset', 'expense'])) {
                    return $carry + $debit - $credit;
                } else {
                    return $carry + $credit - $debit;
                }
            }, 0);

        return $balance ?? 0;
    }

    /**
     * Get account movements for a specific account
     */
    public function getAccountMovements(int $accountId, string $startDate, string $endDate): Collection
    {
        return JournalEntryLine::with(['journalEntry', 'chartOfAccount'])
            ->where('chart_of_account_id', $accountId)
            ->whereHas('journalEntry', function ($q) use ($startDate, $endDate) {
                $q->where('status', 'posted')
                    ->whereBetween('date', [$startDate, $endDate]);
            })
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Calculate running balance as of a specific date
     */
    public function calculateRunningBalance(int $accountId, string $asOfDate): float
    {
        $account = ChartOfAccount::find($accountId);
        if (! $account) {
            return 0;
        }

        $balance = JournalEntryLine::where('chart_of_account_id', $accountId)
            ->whereHas('journalEntry', function ($q) use ($asOfDate) {
                $q->where('status', 'posted')
                    ->where('date', '<=', $asOfDate);
            })
            ->get()
            ->reduce(function ($carry, $line) use ($account) {
                $debit = (float) $line->debit;
                $credit = (float) $line->credit;

                if (in_array($account->type, ['asset', 'expense'])) {
                    return $carry + $debit - $credit;
                } else {
                    return $carry + $credit - $debit;
                }
            }, 0);

        return $balance ?? 0;
    }
}
