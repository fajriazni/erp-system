<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;

class CancelPurchaseOrderService
{
    public function execute(int $purchaseOrderId, string $reason): void
    {
        DB::transaction(function () use ($purchaseOrderId, $reason) {
            $purchaseOrder = PurchaseOrder::with('items')->findOrFail($purchaseOrderId);

            // Domain logic handles validation and state transition
            $purchaseOrder->cancel($reason);

            // Additional application-level concerns
            // e.g., Release reserved inventory, Send notification, etc.
        });
    }
}
