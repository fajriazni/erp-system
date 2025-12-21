<?php

namespace App\Domain\Purchasing\Events;

use App\Models\GoodsReceipt;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GoodsReceiptCancelled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public GoodsReceipt $goodsReceipt,
        public string $reason
    ) {}
}
