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

            return $order->fresh(['items', 'vendor', 'warehouse']);
        });
    }
}
