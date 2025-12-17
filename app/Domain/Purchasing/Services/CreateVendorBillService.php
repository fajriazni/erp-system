<?php

namespace App\Domain\Purchasing\Services;

use App\Models\VendorBill;
use App\Models\VendorBillItem;
use Illuminate\Support\Facades\DB;

class CreateVendorBillService
{
    public function execute(array $data): VendorBill
    {
        return DB::transaction(function () use ($data) {
            // Generate Bill Number
            $count = VendorBill::count() + 1;
            $billNumber = 'BILL-'.date('Y').'-'.str_pad($count, 3, '0', STR_PAD_LEFT);

            $bill = VendorBill::create([
                'purchase_order_id' => $data['purchase_order_id'] ?? null,
                'vendor_id' => $data['vendor_id'],
                'bill_number' => $billNumber,
                'reference_number' => $data['reference_number'],
                'date' => $data['date'],
                'due_date' => $data['due_date'] ?? null,
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
                'total_amount' => 0, // Will calculate below
            ]);

            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                // 3-Way Matching Validation
                if ($bill->purchase_order_id && isset($item['product_id'])) {
                    $poItem = \App\Models\PurchaseOrderItem::where('purchase_order_id', $bill->purchase_order_id)
                        ->where('product_id', $item['product_id'])
                        ->first();

                    if ($poItem) {
                        $availableToBill = $poItem->quantity_received - $poItem->quantity_billed;

                        // Strict check: Cannot bill more than received (and not yet billed)
                        if ($item['quantity'] > $availableToBill) {
                            throw new \InvalidArgumentException(
                                "Cannot bill quantity {$item['quantity']} for Product ID {$item['product_id']}. Only {$availableToBill} is available to bill (Received: {$poItem->quantity_received}, Already Billed: {$poItem->quantity_billed})."
                            );
                        }

                        // Update Billed Quantity
                        $poItem->increment('quantity_billed', $item['quantity']);
                    }
                }

                $lineTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $lineTotal;

                VendorBillItem::create([
                    'vendor_bill_id' => $bill->id,
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $lineTotal,
                ]);
            }

            $bill->update(['total_amount' => $totalAmount]);

            return $bill;
        });
    }
}
