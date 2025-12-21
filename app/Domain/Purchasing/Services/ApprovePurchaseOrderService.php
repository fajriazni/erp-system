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

            // Update Blanket Order Consumption
            if ($purchaseOrder->blanket_order_id) {
                $bpo = $purchaseOrder->blanketOrder;
                
                // We should probably check if BPO is still active? 
                // Technically it was checked at creation, but maybe good to double check or just allow it since it's already committed.
                // Let's just update the consumption.
                
                foreach ($purchaseOrder->items as $item) {
                     // Find matching line in BPO
                     $bpoLine = $bpo->lines()->where('product_id', $item->product_id)->first();
                     
                     if ($bpoLine) {
                         $bpoLine->increment('quantity_ordered', $item->quantity);
                     }
                }
                
                $bpo->updateRealizationStatus();
            }

            // Additional application-level concerns
            // e.g., Reserve inventory, Create accounting entries, etc.
        });
    }
}
