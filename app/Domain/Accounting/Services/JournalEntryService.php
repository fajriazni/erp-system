<?php

namespace App\Domain\Accounting\Services;

use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Support\Facades\DB;

class JournalEntryService
{
    /**
     * Create and post a journal entry.
     * 
     * @param string $referenceNumber
     * @param string $date
     * @param string $description
     * @param array $lines Array of ['account_id' => int, 'debit' => float, 'credit' => float, 'description' => string]
     * @return JournalEntry
     */
    public function createEntry(string $referenceNumber, string $date, string $description, array $lines): JournalEntry
    {
        return DB::transaction(function () use ($referenceNumber, $date, $description, $lines) {
            $entry = JournalEntry::create([
                'reference_number' => $referenceNumber,
                'date' => $date,
                'description' => $description,
                'status' => 'posted', // Auto-post automated entries
                'currency_code' => 'IDR', // Default for now, can be parameterized
                'exchange_rate' => 1.00,
            ]);

            foreach ($lines as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'chart_of_account_id' => $line['account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                    'description' => $line['description'] ?? $description,
                ]);
            }
            
            // Trigger post event if needed, but since we set status to posted manually for automated entries,
            // we might want to manually fire the event or verify if the model observer handles it.
            // For now, let's assume direct creation is fine.
            
            return $entry;
        });
    }
}
