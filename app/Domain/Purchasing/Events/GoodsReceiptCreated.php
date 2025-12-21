<?php

namespace App\Domain\Purchasing\Events;

use App\Models\GoodsReceipt;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GoodsReceiptCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public GoodsReceipt $goodsReceipt
    ) {}
}
