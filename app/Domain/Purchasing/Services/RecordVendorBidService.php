<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseRfq;
use App\Models\VendorQuotation;
use Illuminate\Support\Facades\DB;

class RecordVendorBidService
{
    public function execute(PurchaseRfq $rfq, array $data): VendorQuotation
    {
        return DB::transaction(function () use ($rfq, $data) {
            $quotation = VendorQuotation::updateOrCreate(
                [
                    'purchase_rfq_id' => $rfq->id,
                    'vendor_id' => $data['vendor_id'],
                ],
                [
                    'reference_number' => $data['reference_number'] ?? null,
                    'quote_date' => $data['quote_date'] ?? now(),
                    'valid_until' => $data['valid_until'] ?? null,
                    'currency' => $data['currency'] ?? 'IDR',
                    'notes' => $data['notes'] ?? null,
                    'status' => 'submitted',
                ]
            );

            // Replace lines
            $quotation->lines()->delete();

            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $subtotal;

                $quotation->lines()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            $quotation->update(['total_amount' => $totalAmount]);

            // Update pivot status if vendor was invited
            $rfq->vendors()->updateExistingPivot($data['vendor_id'], ['status' => 'responded']);

            return $quotation;
        });
    }
}
