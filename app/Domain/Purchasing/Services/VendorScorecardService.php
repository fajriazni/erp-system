<?php

namespace App\Domain\Purchasing\Services;

use App\Models\Contact;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReturn;
use App\Models\VendorPerformanceLog;
use Carbon\Carbon;

class VendorScorecardService
{
    /**
     * Record delivery performance when goods are received.
     */
    public function recordDeliveryPerformance(PurchaseOrder $po, GoodsReceipt $gr): void
    {
        $vendor = $po->vendor;
        if (! $vendor) {
            return;
        }

        $expectedDate = $po->expected_date ?? $po->date;
        $receivedDate = $gr->date ?? now();

        // Calculate on-time score: 100 if on-time, reduced by 5% per day late
        $daysLate = Carbon::parse($expectedDate)->diffInDays(Carbon::parse($receivedDate), false);
        $score = max(0, 100 - max(0, $daysLate) * 5);

        VendorPerformanceLog::create([
            'vendor_id' => $vendor->id,
            'metric_type' => VendorPerformanceLog::METRIC_DELIVERY,
            'reference_type' => GoodsReceipt::class,
            'reference_id' => $gr->id,
            'value' => $score,
            'description' => $daysLate > 0 ? "{$daysLate} days late" : 'On time',
            'period_date' => now()->toDateString(),
        ]);
    }

    /**
     * Record quality performance based on QC results.
     */
    public function recordQualityPerformance(GoodsReceipt $gr, int $passedQty, int $failedQty): void
    {
        $vendor = $gr->purchaseOrder?->vendor;
        if (! $vendor) {
            return;
        }

        $totalQty = $passedQty + $failedQty;
        if ($totalQty <= 0) {
            return;
        }

        $qualityScore = round(($passedQty / $totalQty) * 100, 2);

        VendorPerformanceLog::create([
            'vendor_id' => $vendor->id,
            'metric_type' => VendorPerformanceLog::METRIC_QUALITY,
            'reference_type' => GoodsReceipt::class,
            'reference_id' => $gr->id,
            'value' => $qualityScore,
            'description' => "Passed {$passedQty} of {$totalQty} units",
            'period_date' => now()->toDateString(),
        ]);
    }

    /**
     * Record return performance.
     */
    public function recordReturnPerformance(PurchaseReturn $return): void
    {
        $vendor = $return->vendor;
        if (! $vendor) {
            return;
        }

        $returnQty = $return->items->sum('quantity');

        VendorPerformanceLog::create([
            'vendor_id' => $vendor->id,
            'metric_type' => VendorPerformanceLog::METRIC_RETURN,
            'reference_type' => PurchaseReturn::class,
            'reference_id' => $return->id,
            'value' => $returnQty,
            'description' => "Returned {$returnQty} units",
            'period_date' => now()->toDateString(),
        ]);
    }

    /**
     * Calculate and update vendor metrics.
     */
    public function updateVendorMetrics(Contact $vendor): void
    {
        // Calculate on-time rate (average of delivery scores)
        $onTimeRate = VendorPerformanceLog::where('vendor_id', $vendor->id)
            ->where('metric_type', VendorPerformanceLog::METRIC_DELIVERY)
            ->avg('value') ?? null;

        // Calculate quality rate (average of quality scores)
        $qualityRate = VendorPerformanceLog::where('vendor_id', $vendor->id)
            ->where('metric_type', VendorPerformanceLog::METRIC_QUALITY)
            ->avg('value') ?? null;

        // Calculate return rate (returns as % of total received)
        $totalReceived = GoodsReceipt::whereHas('purchaseOrder', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->with('items')
            ->get()
            ->flatMap->items
            ->sum('quantity_received');

        $totalReturned = VendorPerformanceLog::where('vendor_id', $vendor->id)
            ->where('metric_type', VendorPerformanceLog::METRIC_RETURN)
            ->sum('value');

        $returnRate = $totalReceived > 0 ? round(($totalReturned / $totalReceived) * 100, 2) : 0;

        // Calculate overall rating (0-5 stars)
        $ratingScore = $this->calculateRating($onTimeRate, $qualityRate, $returnRate);

        $vendor->update([
            'on_time_rate' => $onTimeRate,
            'quality_rate' => $qualityRate,
            'return_rate' => $returnRate,
            'rating_score' => $ratingScore,
            'last_score_update' => now(),
        ]);
    }

    /**
     * Calculate overall vendor rating (0-5 stars).
     */
    private function calculateRating(?float $onTimeRate, ?float $qualityRate, ?float $returnRate): float
    {
        $weights = [
            'on_time' => 0.35,
            'quality' => 0.45,
            'return' => 0.20,
        ];

        $score = 0;
        $totalWeight = 0;

        if ($onTimeRate !== null) {
            $score += ($onTimeRate / 100) * 5 * $weights['on_time'];
            $totalWeight += $weights['on_time'];
        }

        if ($qualityRate !== null) {
            $score += ($qualityRate / 100) * 5 * $weights['quality'];
            $totalWeight += $weights['quality'];
        }

        if ($returnRate !== null) {
            // Lower return rate is better
            $returnScore = max(0, 100 - $returnRate);
            $score += ($returnScore / 100) * 5 * $weights['return'];
            $totalWeight += $weights['return'];
        }

        if ($totalWeight <= 0) {
            return 0;
        }

        return round($score / $totalWeight, 2);
    }

    /**
     * Get vendor performance summary.
     */
    public function getVendorSummary(Contact $vendor): array
    {
        // Update metrics first
        $this->updateVendorMetrics($vendor);
        $vendor->refresh();

        // Get recent performance logs
        $recentLogs = VendorPerformanceLog::where('vendor_id', $vendor->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return [
            'rating_score' => $vendor->rating_score,
            'on_time_rate' => $vendor->on_time_rate,
            'quality_rate' => $vendor->quality_rate,
            'return_rate' => $vendor->return_rate,
            'last_score_update' => $vendor->last_score_update,
            'recent_logs' => $recentLogs,
        ];
    }
}
