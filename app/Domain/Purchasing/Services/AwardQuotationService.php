<?php

namespace App\Domain\Purchasing\Services;

// Assuming this exists or relies on similar logic
use App\Models\PurchaseOrder;
use App\Models\VendorQuotation;
use Illuminate\Support\Facades\DB;

class AwardQuotationService
{
    public function execute(VendorQuotation $quotation): PurchaseOrder
    {
        return DB::transaction(function () use ($quotation) {
            // 1. Mark Quotation as Won
            $quotation->update([
                'status' => 'won',
                'is_awarded' => true, // Added field
                'awarded_at' => now(),
            ]);

            // 2. Close the RFQ
            $rfq = $quotation->rfq;
            $rfq->update(['status' => 'closed']);

            // 3. Mark other quotations as lost
            $rfq->quotations()
                ->where('id', '!=', $quotation->id)
                ->where('status', 'submitted')
                ->update(['status' => 'lost']);

            // 4. Create Draft Purchase Order
            $year = now()->format('Y');
            $count = PurchaseOrder::whereYear('created_at', $year)->count() + 1;
            $number = 'PO-'.$year.'-'.str_pad($count, 4, '0', STR_PAD_LEFT);

            // Fetch warehouse (default 1 or from user preferences/config)
            $warehouseId = 1;

            $po = PurchaseOrder::create([
                'document_number' => $number,
                'vendor_id' => $quotation->vendor_id,
                'date' => now()->toDateString(),
                'status' => 'draft',
                'source' => 'rfq',
                'warehouse_id' => $warehouseId,
                'total' => $quotation->total_amount,
                'notes' => 'Generated from RFQ '.$rfq->document_number.' / Quote '.($quotation->reference_number ?? 'N/A'),
            ]);

            foreach ($quotation->lines as $line) {
                // Determine UOM ID: from product default
                $product = $line->product;
                $uomId = $product->uom_id;

                $po->items()->create([
                    'product_id' => $line->product_id,
                    'quantity' => $line->quantity,
                    'unit_price' => $line->unit_price,
                    'subtotal' => $line->subtotal,
                    'uom_id' => $uomId,
                    'description' => $product->name, // Start with product name
                ]);
            }

            // Link PO to Quotation
            $quotation->update(['purchase_order_id' => $po->id]);

            return $po;
        });
    }
}
