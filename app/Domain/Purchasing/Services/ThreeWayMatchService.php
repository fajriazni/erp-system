<?php

namespace App\Domain\Purchasing\Services;

use App\Models\VendorBill;

class ThreeWayMatchService
{
    /**
     * Default tolerance percentage for price matching.
     */
    private float $priceTolerance = 5.0; // 5% tolerance

    /**
     * Perform 3-way matching: PO vs GR vs Bill.
     */
    public function match(VendorBill $bill): MatchResult
    {
        $exceptions = [];

        // Load related data
        $bill->load(['items.product', 'purchaseOrder.items', 'purchaseOrder.goodsReceipts.items']);

        $po = $bill->purchaseOrder;

        if (! $po) {
            return new MatchResult(
                status: 'exception',
                exceptions: [['type' => 'no_po', 'message' => 'Bill is not linked to a Purchase Order']]
            );
        }

        // Get received quantities from all GRs for this PO
        $receivedQty = [];
        foreach ($po->goodsReceipts as $gr) {
            foreach ($gr->items as $grItem) {
                $productId = $grItem->product_id;
                $receivedQty[$productId] = ($receivedQty[$productId] ?? 0) + $grItem->quantity_received;
            }
        }

        // Get PO quantities and prices
        $poQty = [];
        $poPrices = [];
        foreach ($po->items as $poItem) {
            $productId = $poItem->product_id;
            $poQty[$productId] = $poItem->quantity;
            $poPrices[$productId] = (float) $poItem->unit_price;
        }

        // Check each bill item
        foreach ($bill->items as $billItem) {
            $productId = $billItem->product_id;
            $productName = $billItem->product?->name ?? "Product #{$productId}";

            // 1. Check Quantity: Bill qty should not exceed GR qty
            $grQty = $receivedQty[$productId] ?? 0;
            if ($billItem->quantity > $grQty) {
                $exceptions[] = [
                    'type' => 'qty_over_received',
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'message' => "Billed qty ({$billItem->quantity}) exceeds received qty ({$grQty})",
                    'billed_qty' => $billItem->quantity,
                    'received_qty' => $grQty,
                ];
            }

            // 2. Check Quantity: Bill qty should not exceed PO qty
            $orderedQty = $poQty[$productId] ?? 0;
            if ($billItem->quantity > $orderedQty) {
                $exceptions[] = [
                    'type' => 'qty_over_ordered',
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'message' => "Billed qty ({$billItem->quantity}) exceeds ordered qty ({$orderedQty})",
                    'billed_qty' => $billItem->quantity,
                    'ordered_qty' => $orderedQty,
                ];
            }

            // 3. Check Price: Bill price should not exceed PO price (with tolerance)
            $orderedPrice = $poPrices[$productId] ?? 0;
            $billedPrice = (float) $billItem->unit_price;

            if ($orderedPrice > 0) {
                $priceVariance = (($billedPrice - $orderedPrice) / $orderedPrice) * 100;

                if ($priceVariance > $this->priceTolerance) {
                    $exceptions[] = [
                        'type' => 'price_over_po',
                        'product_id' => $productId,
                        'product_name' => $productName,
                        'message' => "Billed price ({$billedPrice}) exceeds PO price ({$orderedPrice}) by ".number_format($priceVariance, 1).'%',
                        'billed_price' => $billedPrice,
                        'ordered_price' => $orderedPrice,
                        'variance_percent' => $priceVariance,
                    ];
                }
            }
        }

        $status = count($exceptions) > 0 ? 'exception' : 'matched';

        return new MatchResult(
            status: $status,
            exceptions: $exceptions
        );
    }

    /**
     * Apply match result to a bill.
     */
    public function applyResult(VendorBill $bill, MatchResult $result): void
    {
        $bill->update([
            'match_status' => $result->status,
            'match_exceptions' => $result->exceptions,
        ]);
    }

    /**
     * Set custom price tolerance.
     */
    public function setPriceTolerance(float $percent): self
    {
        $this->priceTolerance = $percent;

        return $this;
    }
}
