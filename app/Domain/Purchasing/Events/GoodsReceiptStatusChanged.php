<?php

namespace App\Domain\Purchasing\Events;

use App\Models\GoodsReceipt;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GoodsReceiptStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public GoodsReceipt $goodsReceipt,
        public string $oldStatus,
        public string $newStatus
    ) {}
}
