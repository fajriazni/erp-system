<?php

namespace App\Domain\Finance\Events;

use App\Models\JournalEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Journal Entry Posted Event
 *
 * Fired when a journal entry is posted to the general ledger.
 */
class JournalEntryPosted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly JournalEntry $journalEntry,
        public readonly User $postedBy,
        public readonly Carbon $postedAt
    ) {}
}
