<?php

namespace App\Domain\Finance\Events;

use App\Domain\Finance\ValueObjects\Money;
use App\Models\Budget;
use App\Models\Department;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Budget Exceeded Event
 *
 * Fired when a transaction exceeds the budget limit.
 */
class BudgetExceeded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Budget $budget,
        public readonly Money $actualAmount,
        public readonly Money $variance,
        public readonly ?Department $department = null
    ) {}

    public function exceedancePercentage(): float
    {
        if ($this->budget->amount == 0) {
            return 0;
        }

        return ($this->variance->amount() / $this->budget->amount) * 100;
    }
}
