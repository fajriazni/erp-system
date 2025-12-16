<?php

namespace App\Domain\Purchasing\Services;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreateGoodsReceiptService
{
    public function execute(array $data): GoodsReceipt
    {
        return DB::transaction(function () use ($data) {
            $purchaseOrder = PurchaseOrder::with('items')->findOrFail($data['purchase_order_id']);

            // 1. Create Goods Receipt
            $gr = GoodsReceipt::create([
                'purchase_order_id' => $data['purchase_order_id'],
                'warehouse_id' => $data['warehouse_id'],
                'receipt_number' => $data['receipt_number'],
                'date' => $data['date'],
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
                'received_by' => auth()->id(),
            ]);

            // 2. Process Items and specific receive logic
            foreach ($data['items'] as $itemData) {
                // Validate Product belongs to PO (Strict check)
                $poItem = $purchaseOrder->items->where('product_id', $itemData['product_id'])->first();
                
                if (!$poItem) {
                    throw new InvalidArgumentException("Product ID {$itemData['product_id']} is not in this Purchase Order.");
                }

                // Check for over-receiving (optional depending on business rule, for now strict warning or just allow but tracked)
                // We will allow over-receiving but logic elsewhere might flag it. 
                // Tracking is updated when POSTED, not created (Draft).
                // So here we simply create the GR lines.

                $gr->items()->create([
                    'product_id' => $itemData['product_id'],
                    'uom_id' => $itemData['uom_id'],
                    'quantity_received' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            return $gr;
        });
    }

    public function post(GoodsReceipt $receipt): void
    {
        if ($receipt->status !== 'draft') {
            throw new InvalidArgumentException("Only draft receipts can be posted.");
        }

        DB::transaction(function () use ($receipt) {
            // 1. Update Status
            $receipt->update(['status' => 'posted']);
            
            $purchaseOrder = $receipt->purchaseOrder;
            // Ensure relationships are loaded
            $purchaseOrder->load('items');

            // 2. Loop through GR items to update Inventory and PO Item Tracking
            foreach ($receipt->items as $grItem) {
                // Update Inventory
                $this->updateInventory($receipt->warehouse_id, $grItem->product_id, $grItem->quantity_received);

                // Update PO Item `quantity_received`
                $poItem = $purchaseOrder->items()->where('product_id', $grItem->product_id)->first();
                if ($poItem) {
                    $poItem->increment('quantity_received', $grItem->quantity_received);
                }
            }

            // 3. Check for PO Completion (Per Item strict check)
            $this->updatePurchaseOrderStatus($purchaseOrder);
        });
    }

    private function updateInventory(int $warehouseId, int $productId, float $quantity): void
    {
        $pivot = DB::table('product_warehouse')
            ->where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->first();

        if ($pivot) {
            DB::table('product_warehouse')
                ->where('id', $pivot->id)
                ->increment('quantity', $quantity);
        } else {
            DB::table('product_warehouse')->insert([
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'quantity' => $quantity,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function updatePurchaseOrderStatus(PurchaseOrder $purchaseOrder): void
    {
        // Reload items to get fresh quantities
        $purchaseOrder->refresh();
        $purchaseOrder->load('items');

        $allReceived = true;
        $anyReceived = false;

        foreach ($purchaseOrder->items as $item) {
            if ($item->quantity_received > 0) {
                $anyReceived = true;
            }
            
            // Allow small float tolerance if needed, but strict here
            if ($item->quantity_received < $item->quantity) {
                $allReceived = false;
            }
        }

        if ($allReceived) {
            $purchaseOrder->update(['status' => 'completed']); // Or 'received' if that is the status name
        } elseif ($anyReceived) {
            $purchaseOrder->update(['status' => 'partial_received']);
        }
    }
}
