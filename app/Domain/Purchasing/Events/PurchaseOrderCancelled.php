<?php

namespace App\Domain\Purchasing\Events;

use App\Models\PurchaseOrder;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PurchaseOrderCancelled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public PurchaseOrder $purchaseOrder,
        public string $reason
    ) {}
}
