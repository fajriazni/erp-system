<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Domain\Inventory\Services\CalculateMovingAverageService;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class CreateGoodsReceiptService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService,
        protected CalculateMovingAverageService $calculateMovingAverageService
    ) {}

    public function execute(array $data): GoodsReceipt
    {
        return DB::transaction(function () use ($data) {
            $purchaseOrder = PurchaseOrder::with('items')->findOrFail($data['purchase_order_id']);

            // Validate PO Status - only allow receiving from approved/locked/partial POs
            if (! in_array($purchaseOrder->status, ['purchase_order', 'locked', 'partial_received'])) {
                throw new InvalidArgumentException(
                    "Cannot create receipt for PO with status '{$purchaseOrder->status}'. ".
                    "PO must be 'purchase_order', 'locked', or 'partial_received'."
                );
            }

            // Check if PO is already fully received
            if ($purchaseOrder->status === 'fully_received') {
                throw new InvalidArgumentException('This Purchase Order has already been fully received.');
            }

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

                if (! $poItem) {
                    throw new InvalidArgumentException("Product ID {$itemData['product_id']} is not in this Purchase Order.");
                }

                // Check for over-receiving
                $remainingQty = $poItem->quantity - $poItem->quantity_received;
                $receivingQty = $itemData['quantity'];

                if ($receivingQty > $remainingQty) {
                    $overQty = $receivingQty - $remainingQty;
                    Log::warning("Over-receiving detected for Product ID {$itemData['product_id']}", [
                        'po_id' => $purchaseOrder->id,
                        'remaining' => $remainingQty,
                        'receiving' => $receivingQty,
                        'over_amount' => $overQty,
                    ]);

                    // You can optionally throw exception here if strict mode:
                    // throw new InvalidArgumentException("Cannot receive {$receivingQty} - only {$remainingQty} remaining for this item.");
                }

                $gr->items()->create([
                    'product_id' => $itemData['product_id'],
                    'uom_id' => $itemData['uom_id'],
                    'quantity_received' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            event(new \App\Domain\Purchasing\Events\GoodsReceiptCreated($gr));

            return $gr;
        });
    }

    public function post(GoodsReceipt $receipt): void
    {
        if ($receipt->status !== 'draft') {
            throw new InvalidArgumentException("Only draft receipts can be posted. Current status: {$receipt->status}");
        }

        if ($receipt->items()->count() === 0) {
            throw new InvalidArgumentException('Cannot post goods receipt without items.');
        }

        // Validate PO is still in valid state
        $purchaseOrder = $receipt->purchaseOrder;
        if (in_array($purchaseOrder->status, ['cancelled', 'draft'])) {
            throw new InvalidArgumentException(
                "Cannot post receipt - Purchase Order is {$purchaseOrder->status}."
            );
        }

        DB::transaction(function () use ($receipt) {
            $oldStatus = $receipt->status;

            // 1. Update Status
            $receipt->update([
                'status' => 'posted',
                'posted_at' => now(),
                'posted_by' => auth()->id(),
            ]);

            $purchaseOrder = $receipt->purchaseOrder;
            // Ensure relationships are loaded
            $purchaseOrder->load('items');

            // 2. Loop through GR items to update Inventory, PO Item Tracking, and Calculate Total Value
            $totalReceiptValue = 0;

            foreach ($receipt->items as $grItem) {
                $poItem = $purchaseOrder->items()->where('product_id', $grItem->product_id)->first();

                if ($poItem) {
                    // Update Product Cost (Moving Average)
                    // We calculate cost BEFORE adding the new stock to get the correct weighted average
                    // But the service handles "Current Total Stock" query.
                    // Since we haven't updated stock yet, "Current Total Stock" is correct (Old Stock).
                    $product = \App\Models\Product::find($grItem->product_id); // Reload product to get latest cost
                    $newCost = $this->calculateMovingAverageService->execute(
                        $product,
                        $grItem->quantity_received,
                        $poItem->unit_price
                    );

                    $product->update(['cost' => $newCost]);

                    // Update Inventory
                    $this->updateInventory($receipt->warehouse_id, $grItem->product_id, $grItem->quantity_received);

                    // Update PO Item `quantity_received`
                    $poItem->increment('quantity_received', $grItem->quantity_received);

                    // Add to total value
                    $totalReceiptValue += $grItem->quantity_received * $poItem->unit_price;
                }
            }

            // 3. Post Journal Entry (Inventory vs Unbilled Payables)
            $inventoryAccount = \App\Models\ChartOfAccount::where('code', '1400')->first();
            $clearingAccount = \App\Models\ChartOfAccount::where('code', '2110')->first();

            if ($inventoryAccount && $clearingAccount && $totalReceiptValue > 0) {
                $lines = [
                    [
                        'chart_of_account_id' => $inventoryAccount->id,
                        'debit' => $totalReceiptValue,
                        'credit' => 0,
                    ],
                    [
                        'chart_of_account_id' => $clearingAccount->id,
                        'debit' => 0,
                        'credit' => $totalReceiptValue,
                    ],
                ];

                $this->createJournalEntryService->execute(
                    \Carbon\Carbon::parse($receipt->date)->format('Y-m-d'),
                    $receipt->receipt_number,
                    "Goods Receipt #{$receipt->receipt_number} - PO #{$purchaseOrder->document_number}",
                    $lines
                );
            }

            // 4. Check for PO Completion (Per Item strict check)
            $this->updatePurchaseOrderStatus($purchaseOrder);

            // 5. Record Vendor Delivery Performance
            app(VendorScorecardService::class)->recordDeliveryPerformance($purchaseOrder, $receipt);

            // 6. Dispatch Events
            event(new \App\Domain\Purchasing\Events\GoodsReceiptStatusChanged($receipt, $oldStatus, 'posted'));
            event(new \App\Domain\Purchasing\Events\GoodsReceiptPosted($receipt));
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
            $purchaseOrder->update(['status' => 'fully_received']);
        } elseif ($anyReceived) {
            $purchaseOrder->update(['status' => 'partial_received']);
        }
    }
}
