<?php

namespace App\Domain\Purchasing\Events;

use App\Models\ThreeWayMatch;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ThreeWayMatchCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ThreeWayMatch $match
    ) {}

    public function hasVariance(): bool
    {
        return abs((float) $this->match->variance_percentage) > 0;
    }

    public function isWithinTolerance(float $tolerancePercentage = 5.0): bool
    {
        return abs((float) $this->match->variance_percentage) <= $tolerancePercentage;
    }
}
