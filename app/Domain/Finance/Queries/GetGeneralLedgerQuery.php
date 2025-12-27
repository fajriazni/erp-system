<?php

namespace App\Domain\Finance\Queries;

use App\Domain\Finance\ValueObjects\AccountingPeriod;
use App\Domain\Finance\ValueObjects\Money;
use App\Models\ChartOfAccount;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Get General Ledger Query
 *
 * Retrieves all journal entry lines for a specific account and period.
 */
class GetGeneralLedgerQuery
{
    /**
     * Execute query
     */
    public function execute(ChartOfAccount $account, AccountingPeriod $period): Collection
    {
        $lines = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.chart_of_account_id', $account->id)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [
                $period->startDate(),
                $period->endDate(),
            ])
            ->select(
                'journal_entries.date',
                'journal_entries.reference_number',
                'journal_entries.description as entry_description',
                'journal_entry_lines.description as line_description',
                'journal_entry_lines.debit',
                'journal_entry_lines.credit'
            )
            ->orderBy('journal_entries.date')
            ->orderBy('journal_entries.reference_number')
            ->get();

        // Calculate running balance
        $balance = Money::zero();
        $normalBalance = $account->normalBalance();

        return $lines->map(function ($line) use (&$balance, $normalBalance) {
            $debit = Money::from($line->debit);
            $credit = Money::from($line->credit);

            // Update balance based on normal balance
            if ($normalBalance === 'debit') {
                $balance = $balance->add($debit);
                if (! $credit->isZero()) {
                    $balance = $balance->subtract($credit);
                }
            } else {
                $balance = $balance->add($credit);
                if (! $debit->isZero()) {
                    $balance = $balance->subtract($debit);
                }
            }

            return [
                'date' => $line->date,
                'reference' => $line->reference_number,
                'description' => $line->line_description ?? $line->entry_description,
                'debit' => $debit->toArray(),
                'credit' => $credit->toArray(),
                'balance' => $balance->toArray(),
            ];
        });
    }
}
