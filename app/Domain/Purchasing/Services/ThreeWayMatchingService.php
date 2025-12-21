<?php

namespace App\Domain\Purchasing\Services;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\ThreeWayMatch;
use App\Models\VendorBill;

class ThreeWayMatchingService
{
    // Tolerance configuration (in percentage)
    protected float $qtyTolerance = 5.0; // 5%

    protected float $priceTolerance = 2.0; // 2%

    protected float $amountTolerance = 3.0; // 3%

    /**
     * Perform 3-way matching when vendor bill is created/updated
     */
    public function performMatching(VendorBill $vendorBill): ThreeWayMatch
    {
        $po = $vendorBill->purchaseOrder;
        $gr = $vendorBill->purchaseOrder->goodsReceipts()->where('status', 'posted')->latest()->first();

        if (! $po) {
            throw new \Exception('Vendor bill must be linked to a purchase order');
        }

        // Create or update matching record
        $match = ThreeWayMatch::updateOrCreate(
            [
                'purchase_order_id' => $po->id,
                'vendor_bill_id' => $vendorBill->id,
            ],
            [
                'goods_receipt_id' => $gr?->id,
                'status' => 'pending',
            ]
        );

        // Perform matching logic
        $this->calculateVariances($match, $po, $gr, $vendorBill);

        return $match;
    }

    /**
     * Calculate variances between PO, GR, and Bill
     */
    protected function calculateVariances(
        ThreeWayMatch $match,
        PurchaseOrder $po,
        ?GoodsReceipt $gr,
        VendorBill $bill
    ): void {
        $discrepancies = [];
        $totalQtyVariance = 0;
        $totalPriceVariance = 0;
        $totalAmountVariance = 0;

        // Compare PO vs Bill (line by line)
        foreach ($bill->items as $billItem) {
            $poItem = $po->items()->where('product_id', $billItem->product_id)->first();

            if (! $poItem) {
                $discrepancies[] = [
                    'product_id' => $billItem->product_id,
                    'type' => 'not_in_po',
                    'message' => 'Product in bill but not in PO',
                ];

                continue;
            }

            // Quantity variance (if GR exists, compare with GR, else with PO)
            $expectedQty = $gr
                ? $gr->items()->where('product_id', $billItem->product_id)->sum('quantity_received')
                : $poItem->quantity;

            $qtyDiff = abs($billItem->quantity - $expectedQty);
            $qtyVariance = ($expectedQty > 0) ? ($qtyDiff / $expectedQty) * 100 : 0;

            if ($qtyVariance > $this->qtyTolerance) {
                $discrepancies[] = [
                    'product_id' => $billItem->product_id,
                    'type' => 'quantity',
                    'expected' => $expectedQty,
                    'actual' => $billItem->quantity,
                    'variance_pct' => round($qtyVariance, 2),
                ];
            }

            $totalQtyVariance += $qtyDiff;

            // Price variance
            $priceDiff = abs($billItem->unit_price - $poItem->unit_price);
            $priceVariance = ($poItem->unit_price > 0) ? ($priceDiff / $poItem->unit_price) * 100 : 0;

            if ($priceVariance > $this->priceTolerance) {
                $discrepancies[] = [
                    'product_id' => $billItem->product_id,
                    'type' => 'price',
                    'expected' => $poItem->unit_price,
                    'actual' => $billItem->unit_price,
                    'variance_pct' => round($priceVariance, 2),
                ];
            }

            $totalPriceVariance += $priceDiff;
            $totalAmountVariance += ($billItem->quantity * $billItem->unit_price) - ($poItem->quantity * $poItem->unit_price);
        }

        // Calculate overall variance percentage
        $overallVariance = ($po->total > 0) ? (abs($totalAmountVariance) / $po->total) * 100 : 0;

        // Determine status based on variances
        $status = $this->determineStatus($discrepancies, $overallVariance);

        // Update match record
        $match->update([
            'qty_variance' => $totalQtyVariance,
            'price_variance' => $totalPriceVariance,
            'amount_variance' => $totalAmountVariance,
            'variance_percentage' => round($overallVariance, 2),
            'discrepancies' => $discrepancies,
            'status' => $status,
            'matched_at' => now(),
            'matched_by' => auth()->id(),
        ]);

        // Dispatch Event
        event(new \App\Domain\Purchasing\Events\ThreeWayMatchCompleted($match));
    }

    /**
     * Set quantity tolerance percentage
     */
    public function setQtyTolerance(float $percentage): self
    {
        $this->qtyTolerance = $percentage;

        return $this;
    }

    /**
     * Set price tolerance percentage
     */
    public function setPriceTolerance(float $percentage): self
    {
        $this->priceTolerance = $percentage;

        return $this;
    }

    /**
     * Set amount tolerance percentage
     */
    public function setAmountTolerance(float $percentage): self
    {
        $this->amountTolerance = $percentage;

        return $this;
    }

    /**
     * Determine match status based on discrepancies
     */
    protected function determineStatus(array $discrepancies, float $overallVariance): string
    {
        if (empty($discrepancies) && $overallVariance <= $this->amountTolerance) {
            return 'matched';
        }

        if ($overallVariance > 10) { // More than 10% variance
            return 'mismatch';
        }

        return 'partial_match';
    }

    /**
     * Get matching dashboard statistics
     */
    public function getDashboardStats(): array
    {
        return [
            'total_matches' => ThreeWayMatch::count(),
            'matched' => ThreeWayMatch::where('status', 'matched')->count(),
            'partial_match' => ThreeWayMatch::where('status', 'partial_match')->count(),
            'mismatch' => ThreeWayMatch::where('status', 'mismatch')->count(),
            'pending_approval' => ThreeWayMatch::whereIn('status', ['partial_match', 'mismatch'])->whereNull('approved_at')->count(),
        ];
    }
}
