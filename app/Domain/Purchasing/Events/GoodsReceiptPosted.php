<?php

namespace App\Domain\Purchasing\Events;

use App\Models\GoodsReceipt;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GoodsReceiptPosted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public GoodsReceipt $goodsReceipt
    ) {}

    /**
     * Get total value of receipt
     */
    public function getTotalValue(): float
    {
        return $this->goodsReceipt->items->sum(function ($item) {
            $poItem = $this->goodsReceipt->purchaseOrder
                ->items()
                ->where('product_id', $item->product_id)
                ->first();

            return $poItem ? ($item->quantity_received * $poItem->unit_price) : 0;
        });
    }
}
