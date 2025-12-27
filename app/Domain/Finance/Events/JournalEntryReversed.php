<?php

namespace App\Domain\Finance\Events;

use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Journal Entry Reversed Event
 *
 * Fired when a journal entry is reversed.
 */
class JournalEntryReversed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly JournalEntry $originalEntry,
        public readonly JournalEntry $reversalEntry,
        public readonly string $reason,
        public readonly User $reversedBy
    ) {}
}
