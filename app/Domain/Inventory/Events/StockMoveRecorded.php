<?php

namespace App\Domain\Inventory\Events;

use App\Models\StockMove;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class StockMoveRecorded
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly StockMove $stockMove
    ) {}
}
