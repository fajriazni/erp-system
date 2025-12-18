<?php

namespace App\Domain\Finance\Services;

use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreateJournalEntryService
{
    /**
     * Create a new Journal Entry.
     *
     * @param  array  $lines  Array of ['chart_of_account_id' => int, 'debit' => float, 'credit' => float]
     */
    public function execute(string $date, string $referenceNumber, ?string $description, array $lines, string $currencyCode = 'USD', float $exchangeRate = 1.0): JournalEntry
    {
        return DB::transaction(function () use ($date, $referenceNumber, $description, $lines, $currencyCode, $exchangeRate) {
            // Validate Balance (in base currency, but input might be foreign?)
            // Assumption: 'debit' and 'credit' in $lines are already in BASE currency value for GL purposes?
            // OR are they in foreign currency?
            // Standard Practice: GL stores Base Currency.
            // If the user inputs Foreign Currency, the Controller/Frontend should convert it OR we do it here.
            // Let's assume $lines contain the BASE CURRENCY amounts.
            // The currency_code and exchange_rate are just informational metadata for now on the Header.

            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($lines as $line) {
                $totalDebit += $line['debit'] ?? 0;
                $totalCredit += $line['credit'] ?? 0;
            }

            // Allow small floating point differences
            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw new InvalidArgumentException("Journal Entry must be balanced. Debits: {$totalDebit}, Credits: {$totalCredit}");
            }

            // Create Header
            $journalEntry = JournalEntry::create([
                'date' => $date,
                'reference_number' => $referenceNumber,
                'description' => $description,
                'status' => 'draft',
                'currency_code' => $currencyCode,
                'exchange_rate' => $exchangeRate,
            ]);

            // Create Lines
            foreach ($lines as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_account_id' => $line['chart_of_account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                ]);
            }

            return $journalEntry;
        });
    }
}
