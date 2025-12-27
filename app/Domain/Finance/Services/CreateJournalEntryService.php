<?php

namespace App\Domain\Finance\Services;

use App\Domain\Finance\Events\JournalEntryCreated;
use App\Domain\Finance\ValueObjects\JournalEntryNumber;
use App\Domain\Finance\ValueObjects\Money;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreateJournalEntryService
{
    /**
     * Create a new Journal Entry.
     *
     * @param  array  $lines  Array of ['chart_of_account_id' => int, 'debit' => float, 'credit' => float]
     */
    public function execute(
        string $date,
        ?string $referenceNumber,
        ?string $description,
        array $lines,
        User $user,
        string $currencyCode = 'USD',
        float $exchangeRate = 1.0
    ): JournalEntry {
        return DB::transaction(function () use ($date, $referenceNumber, $description, $lines, $user, $currencyCode, $exchangeRate) {
            // Generate reference number if not provided
            if (! $referenceNumber) {
                $referenceNumber = (string) JournalEntryNumber::generate();
            }

            // Validate balance using Money value object
            $totalDebit = Money::zero($currencyCode);
            $totalCredit = Money::zero($currencyCode);

            foreach ($lines as $line) {
                $totalDebit = $totalDebit->add(Money::from($line['debit'] ?? 0, $currencyCode));
                $totalCredit = $totalCredit->add(Money::from($line['credit'] ?? 0, $currencyCode));
            }

            if (! $totalDebit->equals($totalCredit)) {
                throw new InvalidArgumentException(
                    "Journal Entry must be balanced. Debits: {$totalDebit->format()}, Credits: {$totalCredit->format()}"
                );
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
                    'description' => $line['description'] ?? null,
                ]);
            }

            // Dispatch event
            event(new JournalEntryCreated($journalEntry->fresh(), $user));

            return $journalEntry->fresh();
        });
    }
}
