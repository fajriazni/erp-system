<?php

namespace App\Domain\Finance\Events;

use App\Domain\Finance\ValueObjects\AccountingPeriod;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Period Closed Event
 *
 * Fired when an accounting period is closed.
 */
class PeriodClosed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly AccountingPeriod $period,
        public readonly Carbon $closedAt,
        public readonly User $closedBy
    ) {}
}
