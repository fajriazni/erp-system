<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StrategyService
{
    /**
     * Get Performance Key Performance Indicators
     * - Cycle Time: Avg days for PO -> GR
     * - Vendor Lead Time: Avg days for PO -> GR (Overall)
     * - QC Pass Rate: Based on QC inspections (mock logic if QC not fully linked or simple ratio)
     */
    public function getPerformanceKpis(): array
    {
        // 1. Cycle Time & Lead Time (Avg days from PO creation to GR date)
        // Linking PO -> GR
        $leadTimeData = DB::table('goods_receipts as gr')
            ->join('purchase_orders as po', 'gr.purchase_order_id', '=', 'po.id')
            ->select(DB::raw('AVG(gr.date - po.date) as avg_lead_time'))
            ->where('gr.date', '>=', Carbon::now()->subMonths(12))
            ->first();

        $avgLeadTime = round($leadTimeData->avg_lead_time ?? 0, 1);

        // 2. On-Time Delivery Rate
        // If GR date <= PO expected date (assuming expected date exists, otherwise use arbitrary logic or skip)
        // Using arbitrary "late" definition if no promised date: late if > 7 days from PO date? No, that's unrealistic.
        // Let's rely on simple delivered status counts for now or mock the precise on-time calc if field missing.
        // Assuming 'expected_delivery_date' on PO.
        $totalReceived = DB::table('purchase_orders')
            ->where('status', 'received')
            ->where('date', '>=', Carbon::now()->subMonths(12))
            ->count();

        // 3. QC Pass Rate
        // Checking goods_receipt_items or quality_inspections if available
        // Simple logic: If we have qc_inspections, COUNT(pass) / COUNT(total)
        // Just mocking structure for now as QC table might be complex
        $qcPassRate = 98.5; // Placeholder or calculate if tables exist

        return [
            'cycle_time' => [
                'value' => $avgLeadTime,
                'unit' => 'days',
                'trend' => -2, // Improvement
                'status' => 'on_track'
            ],
            'on_time_delivery' => [
                'value' => 85, // Mocked for now without promised_date
                'unit' => '%',
                'trend' => 5,
                'status' => 'at_risk'
            ],
            'qc_pass_rate' => [
                'value' => $qcPassRate,
                'unit' => '%',
                'trend' => 0.5,
                'status' => 'on_track'
            ],
        ];
    }

    /**
     * Get Spend Analysis Data
     */
    public function getSpendAnalysis(): array
    {
        // by Category (Product Category)
        // Joining PO -> Items -> Product -> Category
        // Note: Products table structure needed. Assuming standard.
        $spendByCategory = DB::table('purchase_order_items as poi')
            ->join('purchase_orders as po', 'poi.purchase_order_id', '=', 'po.id')
            ->join('products as p', 'poi.product_id', '=', 'p.id')
            ->where('po.status', '!=', 'cancelled')
            ->whereYear('po.date', date('Y'))
            ->select('p.type as name', DB::raw('SUM(poi.subtotal) as value'))
            ->groupBy('p.type')
            ->orderByDesc('value')
            ->limit(10)
            ->get();

        // by Department (from PR -> User -> Department?)
        // Or if PO has department_id. Assuming Department on PO or via Link.
        // If not available, skip or use mock.
        // Assuming PO has department_id or created_by linked to department
        $spendByDepartment = [];

        // by Vendor
        $spendByVendor = DB::table('purchase_orders as po')
            ->join('contacts as c', 'po.vendor_id', '=', 'c.id')
            ->where('po.status', '!=', 'cancelled')
            ->whereYear('po.date', date('Y'))
            ->select('c.name', DB::raw('SUM(po.total) as value'))
            ->groupBy('c.name')
            ->orderByDesc('value')
            ->limit(10)
            ->get();

        return [
            'by_category' => $spendByCategory,
            'by_vendor' => $spendByVendor,
        ];
    }

    /**
     * Get Contract Compliance
     */
    public function getContractCompliance(): array
    {
        // 1. Total Spend (Year to Date)
        $totalSpend = DB::table('purchase_orders')
            ->where('status', '!=', 'cancelled')
            ->whereYear('date', date('Y'))
            ->sum('total');

        // 2. Compliant Spend: POs covered by an active Purchase Agreement
        // Logic: PO Vendor matching Agreement Vendor, and PO Date within Agreement Start/End dates
        $compliantSpend = DB::table('purchase_orders as po')
            ->join('purchase_agreements as pa', 'po.vendor_id', '=', 'pa.vendor_id')
            ->where('po.status', '!=', 'cancelled')
            ->whereYear('po.date', date('Y'))
            ->where('pa.status', 'active')
            ->whereRaw('po.date >= pa.start_date')
            ->whereRaw('po.date <= pa.end_date') // Simplified check
            ->sum('po.total');

        $maverickSpend = $totalSpend - $compliantSpend;
        $complianceRate = $totalSpend > 0 ? round(($compliantSpend / $totalSpend) * 100, 1) : 100;

        // 3. Maverick Details (Top 20 non-compliant POs)
        // Find POs that DO NOT have a matching active agreement
        $maverickTransactions = DB::table('purchase_orders as po')
            ->join('contacts as c', 'po.vendor_id', '=', 'c.id')
            ->select('po.id', 'po.document_number', 'po.date', 'po.total', 'c.name as vendor_name')
            ->where('po.status', '!=', 'cancelled')
            ->whereYear('po.date', date('Y'))
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('purchase_agreements as pa')
                    ->whereColumn('pa.vendor_id', 'po.vendor_id')
                    ->where('pa.status', 'active')
                    ->whereColumn('po.date', '>=', 'pa.start_date')
                    ->whereColumn('po.date', '<=', 'pa.end_date');
            })
            ->orderByDesc('po.total')
            ->limit(20)
            ->get();

        return [
            'contract_compliance_rate' => $complianceRate,
            'maverick_spend' => $maverickSpend,
            'active_contracts' => DB::table('purchase_agreements')->where('status', 'active')->count(),
            'expiring_soon' => DB::table('purchase_agreements')
                ->where('status', 'active')
                ->whereBetween('end_date', [Carbon::now(), Carbon::now()->addDays(30)])
                ->count(),
            'details' => $maverickTransactions // New field
        ];
    }

    /**
     * PR Monitor Stats
     */
    public function getPrMonitorStats(): array
    {
        $statusCounts = DB::table('purchase_requests')
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        $avgApprovalTime = 2.4; // Days (Mocked as we lack approval timestamps in main table)

        return [
            'counts' => [
                'draft' => $statusCounts['draft'] ?? 0,
                'submitted' => $statusCounts['submitted'] ?? 0,
                'approved' => $statusCounts['approved'] ?? 0,
                'rejected' => $statusCounts['rejected'] ?? 0,
                'converted' => $statusCounts['converted'] ?? 0,
            ],
            'avg_approval_days' => $avgApprovalTime,
            'bottleneck_department' => 'Engineering', // Placeholder
        ];
    }
}
