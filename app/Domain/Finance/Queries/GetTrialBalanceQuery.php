<?php

namespace App\Domain\Finance\Queries;

use App\Models\ChartOfAccount;
use Illuminate\Support\Facades\DB;

class GetTrialBalanceQuery
{
    /**
     * Get Trial Balance as of a specific date.
     *
     * @param  string  $asOfDate  YYYY-MM-DD
     * @return \Illuminate\Support\Collection
     */
    public function execute(string $asOfDate)
    {
        return ChartOfAccount::query()
            ->leftJoin('journal_entry_lines', 'chart_of_accounts.id', '=', 'journal_entry_lines.chart_of_account_id')
            ->leftJoin('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->select(
                'chart_of_accounts.id',
                'chart_of_accounts.code',
                'chart_of_accounts.name',
                'chart_of_accounts.type',
                DB::raw('COALESCE(SUM(CASE WHEN journal_entries.date <= ? THEN journal_entry_lines.debit ELSE 0 END), 0) as total_debit'),
                DB::raw('COALESCE(SUM(CASE WHEN journal_entries.date <= ? THEN journal_entry_lines.credit ELSE 0 END), 0) as total_credit')
            )
            ->where(function ($query) {
                // Include posted entries, or if we don't strict enforce status yet, all.
                // Assuming we filter by status if 'posted' status is strictly used.
                // For now, let's include all non-voided if specific status exists, or just all.
                // If status column exists, let's use it.
                $query->where('journal_entries.status', 'posted')
                    ->orWhereNull('journal_entries.id'); // To keep accounts with no transactions
            })
            ->groupBy('chart_of_accounts.id', 'chart_of_accounts.code', 'chart_of_accounts.name', 'chart_of_accounts.type')
            ->orderBy('chart_of_accounts.code')
            ->addBinding($asOfDate, 'select') // Bind for first CASE WHEN
            ->addBinding($asOfDate, 'select') //  Bind for second CASE WHEN
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'code' => $account->code,
                    'name' => $account->name,
                    'type' => $account->type,
                    'debit' => (float) $account->total_debit,
                    'credit' => (float) $account->total_credit,
                    'net_balance' => (float) $account->total_debit - (float) $account->total_credit,
                ];
            });
    }
}
