<?php

namespace App\Domain\Finance\Services;

use App\Domain\Finance\Events\JournalEntryPosted;
use App\Models\JournalEntry;
use App\Models\User;
use InvalidArgumentException;

/**
 * Post Journal Entry Service
 *
 * Posts a draft journal entry to the general ledger.
 */
class PostJournalEntryService
{
    /**
     * Post journal entry
     */
    public function execute(JournalEntry $entry, User $user): JournalEntry
    {
        if (! $entry->canBePosted()) {
            throw new InvalidArgumentException('Journal entry cannot be posted');
        }

        if (! $entry->isBalanced()) {
            throw new InvalidArgumentException('Journal entry must be balanced before posting');
        }

        $entry->update(['status' => 'posted']);

        event(new JournalEntryPosted($entry->fresh(), $user, now()));

        return $entry->fresh();
    }

    /**
     * Post multiple journal entries
     */
    public function batch(array $entries, User $user): array
    {
        $posted = [];

        foreach ($entries as $entry) {
            try {
                $posted[] = $this->execute($entry, $user);
            } catch (InvalidArgumentException $e) {
                // Skip entries that cannot be posted
                continue;
            }
        }

        return $posted;
    }
}
