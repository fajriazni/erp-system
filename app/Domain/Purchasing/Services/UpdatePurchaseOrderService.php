<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Purchasing\ValueObjects\Money;
use App\Domain\Purchasing\ValueObjects\TaxCalculation;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;

class UpdatePurchaseOrderService
{
    public function execute(int $purchaseOrderId, array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($purchaseOrderId, $data) {
            $order = PurchaseOrder::with('items')->findOrFail($purchaseOrderId);

            // Validate can be updated
            if (! $order->canBeEdited()) {
                throw new \InvalidArgumentException('Purchase order cannot be edited in current status');
            }

            // Update order header
            $order->update([
                'vendor_id' => $data['vendor_id'] ?? $order->vendor_id,
                'warehouse_id' => $data['warehouse_id'] ?? $order->warehouse_id,
                'date' => $data['date'] ?? $order->date,
                'notes' => $data['notes'] ?? $order->notes,
                'payment_term_id' => $data['payment_term_id'] ?? $order->payment_term_id,
                'tax_rate' => $data['tax_rate'] ?? $order->tax_rate,
                'withholding_tax_rate' => $data['withholding_tax_rate'] ?? $order->withholding_tax_rate,
                'tax_inclusive' => $data['tax_inclusive'] ?? $order->tax_inclusive,
            ]);

            // Update items if provided
            if (isset($data['items'])) {
                // Delete existing items
                $order->items()->delete();

                // Create new items
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
            }

            return $order->fresh(['items', 'vendor', 'warehouse']);
        });
    }
}
