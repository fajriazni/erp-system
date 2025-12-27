<?php

namespace App\Domain\Accounting\ACL;

use App\Models\GoodsReceipt;

final class PurchasingAdapter implements PurchasingAdapterInterface
{
    public function translateBill(object $bill): array
    {
        // This method will be used for VendorBills if we fire an event for them.
        // For now, let's focus on Goods Receipts (GR/IR Clearing logic).
        throw new \BadMethodCallException('VendorBill translation not implemented yet.');
    }

    public function translateGoodsReceipt(GoodsReceipt $receipt): array
    {
        // Mapping rule for Goods Receipt:
        // Debit Inventory (1200)
        // Credit GR/IR Clearing (2110)

        // Calculation logic duplicated from event if needed, or use a service
        $totalValue = $receipt->items->sum(function ($item) use ($receipt) {
            $poItem = $receipt->purchaseOrder
                ->items()
                ->where('product_id', $item->product_id)
                ->first();

            return $poItem ? ($item->quantity_received * $poItem->unit_price) : 0;
        });

        $lines = [];

        // 1. Debit Inventory (1200)
        $lines[] = [
            'account_code' => '1200',
            'amount' => $totalValue,
            'type' => 'debit',
            'description' => "Inventory Receipt - GR #{$receipt->receipt_number}",
        ];

        // 2. Credit GR/IR Clearing (2110)
        $lines[] = [
            'account_code' => '2110',
            'amount' => $totalValue,
            'type' => 'credit',
            'description' => "GR/IR Clearing - GR #{$receipt->receipt_number}",
        ];

        return [
            'date' => now()->format('Y-m-d'), // Use receipt date if available
            'description' => "Auto-Journal: Goods Receipt #{$receipt->receipt_number} from {$receipt->vendor->name}",
            'lines' => $lines,
        ];
    }
}
