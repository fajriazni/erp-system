<?php

namespace App\Domain\Purchasing\Events;

use App\Models\GoodsReceiptItem;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QualityInspectionCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public GoodsReceiptItem $item,
        public int $passedQty,
        public int $failedQty,
        public ?string $notes = null
    ) {}

    public function getTotalInspected(): int
    {
        return $this->passedQty + $this->failedQty;
    }

    public function getPassRate(): float
    {
        $total = $this->getTotalInspected();

        return $total > 0 ? ($this->passedQty / $total) * 100 : 0;
    }
}
