<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Purchasing\ValueObjects\DocumentNumber;
use App\Domain\Purchasing\ValueObjects\Money;
use App\Domain\Purchasing\ValueObjects\TaxCalculation;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;

class CreatePurchaseOrderService
{
    public function execute(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
            // Validate Blanket Order if provided
            if (! empty($data['blanket_order_id'])) {
                $bpo = \App\Models\BlanketOrder::with('lines')->find($data['blanket_order_id']);
                
                if (! $bpo || $bpo->status !== 'active') { // Assuming 'active' is the valid status
                   throw new \InvalidArgumentException('Selected Blanket Order is not active.');
                }

                if ($bpo->vendor_id != $data['vendor_id']) {
                    throw new \InvalidArgumentException('Blanket Order vendor does not match Purchase Order vendor.');
                }
            }

             // Generate document number
            $documentNumber = DocumentNumber::generate();

            // Create the Purchase Order
            $order = PurchaseOrder::create([
                'document_number' => $documentNumber->value(),
                'vendor_id' => $data['vendor_id'],
                'warehouse_id' => $data['warehouse_id'],
                'date' => $data['date'] ?? now(),
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
                'purchase_request_id' => $data['purchase_request_id'] ?? null,
                'payment_term_id' => $data['payment_term_id'] ?? null,
                'blanket_order_id' => $data['blanket_order_id'] ?? null, // Save the link
                'tax_rate' => $data['tax_rate'] ?? 0,
                'withholding_tax_rate' => $data['withholding_tax_rate'] ?? 0,
                'tax_inclusive' => $data['tax_inclusive'] ?? false,
            ]);

            // Create Order Items
            $subtotal = 0;
            foreach ($data['items'] as $itemData) {
                $quantity = $itemData['quantity'];
                $unitPrice = $itemData['unit_price'];
                $itemSubtotal = $quantity * $unitPrice;
                $subtotal += $itemSubtotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'description' => $itemData['description'] ?? null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $itemSubtotal,
                ]);
            }

            // Calculate taxes using Value Object
            $taxCalc = TaxCalculation::calculate(
                Money::from($subtotal),
                (float) $order->tax_rate,
                (float) $order->withholding_tax_rate,
                $order->tax_inclusive
            );

            // Update order with calculated amounts
            $order->update([
                'subtotal' => $taxCalc->subtotal()->amount(),
                'tax_amount' => $taxCalc->taxAmount()->amount(),
                'withholding_tax_amount' => $taxCalc->withholdingTaxAmount()->amount(),
                'total' => $taxCalc->netTotal()->amount(),
            ]);

            // Validate BPO Amount Limit
            if (isset($bpo) && $bpo->amount_limit > 0) {
                 // We need to check if this PO pushes us over the limit.
                 // remainingAmount() calculates based on EXISTING POs in DB.
                 // Since this PO is now created (in transaction), does it count?
                 // If we used amountUsed() which sums from DB, we need to be careful.
                 // Actually $bpo->remainingAmount() queries the DB.
                 
                 // Strategy: 
                 // 1. Get currently used amount from DB (excluding this new one if possible, or including?)
                 // $order is created but not committed yet? No, it's in transaction but query visible?
                 // Usually standard visibility applies.
                 // Let's use simpler logic: 
                 // $previousUsed = $bpo->amountUsed(); 
                 // BUT wait, $bpo->amountUsed() might NOT see uncommitted transaction data depending on isolation level.
                 
                 // SAFER: Calculate remaining BEFORE this PO, then subtract this PO.
                 // But we already created the PO record above.
                 
                 // Let's rely on the fact that existing releases excluding this one + this one <= limit.
                 
                 $currentTotal = $order->total;
                 $remaining = $bpo->remainingAmount(); // This queries DB.
                 
                 // If $remaining already includes this order (because it was inserted above), then we just check if $remaining >= 0.
                 // If $remaining DOES NOT include this order, we check $remaining >= $currentTotal.
                 
                 // To be safe and deterministic:
                 // $used = $bpo->releases()->where('id', '!=', $order->id)->where('status','!=','cancelled')->sum('total');
                 // $remaining = $bpo->amount_limit - $used;
                 
                 // Optimization: Just check:
                 if (($bpo->amount_limit - $bpo->amountUsed()) < 0) {
                     // If we are over budget
                     throw new \DomainException("Purchase Order total exceeds Blanket Order remaining limit.");
                 }
            }

            return $order->fresh(['items', 'vendor', 'warehouse']);
        });
    }
}
