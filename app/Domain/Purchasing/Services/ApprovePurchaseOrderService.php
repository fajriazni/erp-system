<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;

class ApprovePurchaseOrderService
{
    public function execute(int $purchaseOrderId): void
    {
        DB::transaction(function () use ($purchaseOrderId) {
            $purchaseOrder = PurchaseOrder::with('items')->findOrFail($purchaseOrderId);

            // Domain logic handles validation and state transition
            $purchaseOrder->approve();

            // Additional application-level concerns
            // e.g., Reserve inventory, Create accounting entries, etc.
        });
    }
}
