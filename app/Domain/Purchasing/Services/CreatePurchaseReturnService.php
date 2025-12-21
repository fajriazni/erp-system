<?php

namespace App\Domain\Purchasing\Services;

use App\Models\GoodsReceiptItem;
use App\Models\PurchaseReturn;
use Illuminate\Support\Facades\DB;

class CreatePurchaseReturnService
{
    /**
     * Create purchase return from GR or manual
     */
    public function execute(array $data): PurchaseReturn
    {
        return DB::transaction(function () use ($data) {
            // Generate return number
            $returnNumber = $this->generateReturnNumber();

            // Create return header
            $return = PurchaseReturn::create([
                'return_number' => $returnNumber,
                'goods_receipt_id' => $data['goods_receipt_id'] ?? null,
                'purchase_order_id' => $data['purchase_order_id'],
                'vendor_id' => $data['vendor_id'],
                'warehouse_id' => $data['warehouse_id'],
                'return_date' => $data['return_date'] ?? now(),
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'draft',
                'created_by' => auth()->id(),
            ]);

            // Create return items
            foreach ($data['items'] as $item) {
                $return->items()->create([
                    'goods_receipt_item_id' => $item['goods_receipt_item_id'] ?? null,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'uom_id' => $item['uom_id'],
                    'unit_price' => $item['unit_price'],
                    'condition' => $item['condition'] ?? null,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            // Calculate total
            $return->update([
                'total_amount' => $return->items->sum('subtotal'),
            ]);

            return $return->load('items.product', 'vendor', 'warehouse');
        });
    }

    /**
     * Create return from QC failed items
     */
    public function createFromQcFailure(GoodsReceiptItem $grItem, float $failedQty): PurchaseReturn
    {
        $gr = $grItem->goodsReceipt;

        return $this->execute([
            'goods_receipt_id' => $gr->id,
            'purchase_order_id' => $gr->purchase_order_id,
            'vendor_id' => $gr->purchaseOrder->vendor_id,
            'warehouse_id' => $gr->warehouse_id,
            'return_date' => now(),
            'reason' => 'QC Failure',
            'items' => [
                [
                    'goods_receipt_item_id' => $grItem->id,
                    'product_id' => $grItem->product_id,
                    'quantity' => $failedQty,
                    'uom_id' => $grItem->uom_id,
                    'unit_price' => $grItem->goodsReceipt->purchaseOrder->items()
                        ->where('product_id', $grItem->product_id)
                        ->first()->unit_price,
                    'condition' => 'defective',
                    'notes' => 'Auto-created from QC inspection failure',
                ],
            ],
        ]);
    }

    /**
     * Ship the return
     */
    public function ship(PurchaseReturn $return): void
    {
        if ($return->status !== 'ready_to_ship') {
            throw new \Exception('Return must be authorized before shipping');
        }

        $return->ship();
    }

    /**
     * Mark as received by vendor
     */
    public function receiveByVendor(PurchaseReturn $return): void
    {
        if ($return->status !== 'shipped') {
            throw new \Exception('Return must be shipped first');
        }

        $return->receiveByVendor();

        // Auto-create debit note
        app(DebitNoteService::class)->createFromReturn($return);
    }

    protected function generateReturnNumber(): string
    {
        $year = now()->format('y');
        $month = now()->format('m');

        $lastReturn = PurchaseReturn::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->latest('id')
            ->first();

        $sequence = $lastReturn ? ((int) substr($lastReturn->return_number, -4)) + 1 : 1;

        return sprintf('RMA-%s%s-%04d', $year, $month, $sequence);
    }
}
