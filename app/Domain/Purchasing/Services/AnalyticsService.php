<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Calculate Price Variance between PO and Invoice
     *
     * @param  array  $filters  Optional filters: date_from, date_to, vendor_id, product_id, threshold
     */
    public function calculatePriceVariance(array $filters = []): array
    {
        $threshold = $filters['threshold'] ?? 5; // Default 5% variance threshold

        // Simplified version: Compare PO total vs Bill total (since bill_items don't link to PO items)
        // For more accurate variance, we'd need a proper link between bill items and PO items
        $query = DB::table('vendor_bills as vb')
            ->join('purchase_orders as po', 'vb.purchase_order_id', '=', 'po.id')
            ->join('contacts as c', 'po.vendor_id', '=', 'c.id')
            ->select(
                'c.name as vendor_name',
                'c.id as vendor_id',
                'po.document_number as po_number',
                'vb.bill_number as invoice_number',
                'po.date as po_date',
                'vb.date as bill_date',
                'po.total as po_amount',
                'vb.total_amount as invoice_amount',
                DB::raw('(vb.total_amount - po.total) as variance_amount'),
                DB::raw('ROUND(((vb.total_amount - po.total) / NULLIF(po.total, 0)) * 100, 2) as variance_percent')
            )
            ->where('vb.status', '!=', 'cancelled')
            ->where('vb.status', '!=', 'draft')
            ->whereNotNull('vb.purchase_order_id')
            ->whereRaw('ABS((vb.total_amount - po.total) / NULLIF(po.total, 0)) * 100 >= ?', [$threshold]);

        // Apply filters
        if (! empty($filters['date_from'])) {
            $query->where('vb.date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->where('vb.date', '<=', $filters['date_to']);
        }
        if (! empty($filters['vendor_id'])) {
            $query->where('po.vendor_id', $filters['vendor_id']);
        }
        // The product_id filter is not applicable with the simplified query
        // if (! empty($filters['product_id'])) {
        //     $query->where('poi.product_id', $filters['product_id']);
        // }

        $details = $query->get();

        // Calculate summary
        $summary = [
            'total_variance_amount' => abs($details->sum('variance_amount')),
            'average_variance_percent' => abs($details->avg('variance_percent') ?? 0),
            'high_variance_count' => $details->count(),
            'affected_vendors' => $details->unique('vendor_id')->count(),
        ];

        // Prepare chart data (top 10 vendors by total variance)
        $chartData = $details->groupBy('vendor_id')
            ->map(function ($group) {
                return [
                    'product' => $group->first()->vendor_name, // Using vendor as proxy since we don't have item-level data
                    'variance' => abs($group->sum('variance_amount')),
                ];
            })
            ->sortByDesc('variance')
            ->take(10)
            ->values()
            ->toArray();

        return [
            'summary' => $summary,
            'details' => $details->toArray(),
            'chartData' => $chartData,
        ];
    }

    /**
     * Get Open PO Aging Breakdown
     *
     * @param  array  $filters  Optional filters: vendor_id, status, aging_category
     */
    public function getPoAgingBreakdown(array $filters = []): array
    {
        $today = Carbon::today();

        // Query open POs - using created_at as proxy for aging since expected_delivery_date doesn't exist
        $query = PurchaseOrder::query()
            ->with(['vendor', 'items'])
            ->whereNotIn('status', ['cancelled', 'closed', 'billed'])
            ->select('purchase_orders.*')
            ->addSelect(DB::raw("
                CASE
                    WHEN ('{$today}'::date - created_at::date) > 30 THEN 'critical'
                    WHEN ('{$today}'::date - created_at::date) BETWEEN 15 AND 30 THEN 'at_risk'
                    WHEN ('{$today}'::date - created_at::date) < 15 THEN 'on_track'
                    ELSE 'future'
                END as aging_category
            "))
            ->addSelect(DB::raw("('{$today}'::date - created_at::date) as days_old"));

        // Apply filters
        if (! empty($filters['vendor_id'])) {
            $query->where('vendor_id', $filters['vendor_id']);
        }
        if (! empty($filters['aging_category'])) {
            $query->having('aging_category', $filters['aging_category']);
        }

        $pos = $query->get();

        // Calculate summary
        $summary = [
            'total_open' => $pos->count(),
            'critical' => $pos->where('aging_category', 'critical')->count(),
            'at_risk' => $pos->where('aging_category', 'at_risk')->count(),
            'on_track' => $pos->where('aging_category', 'on_track')->count(),
        ];

        // Prepare chart data
        $chartData = [
            ['name' => 'Critical (>30 days)', 'value' => $summary['critical']],
            ['name' => 'At Risk (15-30 days)', 'value' => $summary['at_risk']],
            ['name' => 'On Track (<15 days)', 'value' => $summary['on_track']],
        ];

        // Prepare details
        $details = $pos->map(function ($po) {
            return [
                'po_number' => $po->document_number,
                'vendor' => $po->vendor->name ?? 'N/A',
                'created_date' => $po->created_at?->format('Y-m-d'),
                'days_old' => $po->days_old ?? 0,
                'outstanding_value' => $po->total,
                'status' => $po->status,
                'aging_category' => $po->aging_category,
            ];
        })->toArray();

        return [
            'summary' => $summary,
            'details' => $details,
            'chartData' => $chartData,
        ];
    }

    /**
     * Get Historical Purchase Trends
     *
     * @param  int  $months  Number of months to analyze (default: 12)
     * @param  string  $groupBy  Grouping: 'month', 'quarter', 'year'
     */
    public function getHistoricalTrends(int $months = 12, string $groupBy = 'month'): array
    {
        $startDate = Carbon::now()->subMonths($months);

        // Monthly spend trend
        $trendData = PurchaseOrder::query()
            ->where('date', '>=', $startDate)
            ->whereIn('status', ['purchase_order', 'received', 'billed', 'closed'])
            ->select(
                DB::raw("TO_CHAR(date, 'YYYY-MM') as month"),
                DB::raw('SUM(total) as amount')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::parse($item->month)->format('M Y'),
                    'amount' => round($item->amount, 2),
                ];
            })
            ->toArray();

        // Category breakdown - using product types as proxy
        $categoryData = DB::table('purchase_order_items as poi')
            ->join('purchase_orders as po', 'poi.purchase_order_id', '=', 'po.id')
            ->join('products as p', 'poi.product_id', '=', 'p.id')
            ->where('po.date', '>=', $startDate)
            ->whereIn('po.status', ['purchase_order', 'received', 'billed', 'closed'])
            ->select(
                DB::raw("COALESCE(p.type, 'Uncategorized') as name"),
                DB::raw('SUM(poi.subtotal) as value')
            )
            ->groupBy('p.type')
            ->orderByDesc('value')
            ->limit(6)
            ->get()
            ->toArray();

        // Top vendors
        $vendorData = PurchaseOrder::query()
            ->join('contacts as c', 'purchase_orders.vendor_id', '=', 'c.id')
            ->where('purchase_orders.date', '>=', $startDate)
            ->whereIn('purchase_orders.status', ['purchase_order', 'received', 'billed', 'closed'])
            ->select(
                'c.name as vendor',
                DB::raw('SUM(purchase_orders.total) as amount')
            )
            ->groupBy('c.id', 'c.name')
            ->orderByDesc('amount')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'vendor' => $item->vendor,
                    'amount' => round($item->amount, 2),
                ];
            })
            ->toArray();

        // Calculate insights
        $allData = collect($trendData);
        $peakMonth = $allData->sortByDesc('amount')->first();
        $avgSpend = $allData->avg('amount');

        // YoY growth (if we have 12+ months of data)
        $yoyGrowth = 0;
        if ($months >= 12 && $allData->count() >= 12) {
            $recentMonths = $allData->slice(-3)->avg('amount');
            $oldMonths = $allData->slice(0, 3)->avg('amount');
            if ($oldMonths > 0) {
                $yoyGrowth = (($recentMonths - $oldMonths) / $oldMonths) * 100;
            }
        }

        $topCategory = collect($categoryData)->sortByDesc('value')->first();

        $insights = [
            'peak_month' => $peakMonth['month'] ?? 'N/A',
            'avg_monthly_spend' => round($avgSpend, 2),
            'yoy_growth' => round($yoyGrowth, 2),
            'top_category' => $topCategory->name ?? 'N/A',
        ];

        return [
            'trendData' => $trendData,
            'categoryData' => $categoryData,
            'vendorData' => $vendorData,
            'insights' => $insights,
        ];
    }
}
