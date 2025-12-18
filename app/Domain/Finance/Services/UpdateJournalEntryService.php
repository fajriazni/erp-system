<?php

namespace App\Domain\Finance\Services;

use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class UpdateJournalEntryService
{
    /**
     * Update an existing Journal Entry.
     *
     * @param  array  $lines  Array of ['chart_of_account_id' => int, 'debit' => float, 'credit' => float]
     */
    public function execute(JournalEntry $entry, string $date, ?string $description, array $lines, string $currencyCode = 'USD', float $exchangeRate = 1.0): JournalEntry
    {
        if ($entry->status === 'posted') {
            throw new InvalidArgumentException('Cannot update a posted journal entry.');
        }

        return DB::transaction(function () use ($entry, $date, $description, $lines, $currencyCode, $exchangeRate) {
            // Validate Balance
            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($lines as $line) {
                $totalDebit += $line['debit'] ?? 0;
                $totalCredit += $line['credit'] ?? 0;
            }

            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw new InvalidArgumentException("Journal Entry must be balanced. Debits: {$totalDebit}, Credits: {$totalCredit}");
            }

            // Update Header
            $entry->update([
                'date' => $date,
                'description' => $description,
                'currency_code' => $currencyCode,
                'exchange_rate' => $exchangeRate,
            ]);

            // Replace Lines (Full Replacement strategy for simplicity in Draft)
            $entry->lines()->delete();

            foreach ($lines as $line) {
                $entry->lines()->create([
                    'chart_of_account_id' => $line['chart_of_account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                ]);
            }

            return $entry;
        });
    }
}
