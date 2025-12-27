<?php

namespace App\Domain\Finance\Events;

use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Journal Entry Created Event
 *
 * Fired when a new journal entry is created.
 */
class JournalEntryCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly JournalEntry $journalEntry,
        public readonly User $createdBy
    ) {}
}
