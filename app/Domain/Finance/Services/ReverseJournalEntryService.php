<?php

namespace App\Domain\Finance\Services;

use App\Domain\Finance\Events\JournalEntryReversed;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Reverse Journal Entry Service
 *
 * Creates a reversal entry for a posted journal entry.
 */
class ReverseJournalEntryService
{
    /**
     * Reverse a journal entry
     */
    public function execute(JournalEntry $entry, User $user, string $reason): JournalEntry
    {
        if (! $entry->isPosted()) {
            throw new InvalidArgumentException('Only posted entries can be reversed');
        }

        if ($entry->hasBeenReversed()) {
            throw new InvalidArgumentException('Journal entry has already been reversed');
        }

        return DB::transaction(function () use ($entry, $user, $reason) {
            // Create reversal entry
            $reversalEntry = JournalEntry::create([
                'reference_number' => $entry->reference_number.'-REV',
                'date' => now(),
                'description' => "Reversal of {$entry->reference_number}: {$reason}",
                'status' => 'posted',
                'currency_code' => $entry->currency_code,
                'exchange_rate' => $entry->exchange_rate,
                'reversed_entry_id' => $entry->id,
            ]);

            // Create reversed lines (swap debit/credit)
            foreach ($entry->lines as $line) {
                $reversalEntry->lines()->create([
                    'chart_of_account_id' => $line->chart_of_account_id,
                    'debit' => $line->credit,
                    'credit' => $line->debit,
                    'description' => $line->description,
                ]);
            }

            event(new JournalEntryReversed($entry, $reversalEntry->fresh(), $reason, $user));

            return $reversalEntry->fresh();
        });
    }
}
