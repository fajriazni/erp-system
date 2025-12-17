<?php

namespace App\Domain\Purchasing\Services\Stats;

use App\Models\PurchaseOrder;
use Carbon\Carbon;

class GetSpendAnalysisService
{
    /**
     * Get spend analysis grouped by month for the last X months.
     */
    public function execute(int $months = 12): array
    {
        $startDate = Carbon::now()->subMonths($months - 1)->startOfMonth();

        // Aggregate Purchase Orders by month
        // We use 'purchase_order' status or 'closed' (if we had strictly closed POs for billing)
        // For accurate spend, we should probably look at Vendor Bills, but POs give "Committed Spend".
        // Let's use POs as requested in plan (PurchaseOrder status='purchase_order'/'closed').

        // Fetch data and group in PHP for database compatibility (SQLite/MySQL)
        $data = PurchaseOrder::whereIn('status', ['purchase_order', 'closed', 'received', 'billed'])
            ->where('date', '>=', $startDate)
            ->get()
            ->groupBy(function ($po) {
                return $po->date->format('Y-m');
            })
            ->map(function ($group) {
                return (object) ['total_spend' => $group->sum('total')];
            });

        $result = [];
        $current = clone $startDate;
        $end = Carbon::now()->endOfMonth();

        while ($current <= $end) {
            $monthKey = $current->format('Y-m');
            // $data is a collection where key is 'Y-m'
            $record = $data->get($monthKey);

            $result[] = [
                'month' => $current->format('M Y'), // e.g. "Jan 2024"
                'key' => $monthKey,
                'amount' => $record ? (float) $record->total_spend : 0,
            ];

            $current->addMonth();
        }

        return $result;
    }
}
