<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\AnalyticsService;
use App\Domain\Purchasing\Services\Stats\GetPayableAgingService;
use App\Domain\Purchasing\Services\Stats\GetSpendAnalysisService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    public function index(
        GetSpendAnalysisService $spendService,
        GetPayableAgingService $agingService
    ) {
        $spendData = $spendService->execute(6); // Last 6 months
        $agingData = $agingService->execute();

        // Top Vendors by PO volume (Simple logic inline for now, or extract to service if complex)
        $topVendors = DB::table('purchase_orders')
            ->join('contacts', 'purchase_orders.vendor_id', '=', 'contacts.id')
            ->whereIn('purchase_orders.status', ['purchase_order', 'closed', 'received', 'billed'])
            ->whereYear('purchase_orders.date', date('Y'))
            ->select('contacts.name as company_name', DB::raw('SUM(purchase_orders.total) as total_spend'))
            ->groupBy('contacts.id', 'contacts.name')
            ->orderByDesc('total_spend')
            ->limit(5)
            ->get();

        return Inertia::render('Purchasing/reports/index', [
            'spendData' => $spendData,
            'agingData' => $agingData,
            'topVendors' => $topVendors,
        ]);
    }

    /**
     * Price Variance Analysis Report
     * Compares PO prices vs Invoice prices to detect cost overruns
     */
    public function priceVariance(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'vendor_id', 'product_id', 'threshold']);

        $data = $this->analyticsService->calculatePriceVariance($filters);
        $data['currency'] = \App\Models\Company::default()->currency;

        return Inertia::render('Purchasing/reports/Variance', $data);
    }

    /**
     * Open PO Aging Report
     * Tracks purchase orders with delayed or incomplete deliveries
     */
    public function openPoAging(Request $request)
    {
        $filters = $request->only(['vendor_id', 'status', 'aging_category']);

        $data = $this->analyticsService->getPoAgingBreakdown($filters);
        $data['currency'] = \App\Models\Company::default()->currency;

        return Inertia::render('Purchasing/reports/Aging', $data);
    }

    /**
     * Historical Purchase Analytics
     * Provides trend analysis and forecasting data
     */
    public function historyAnalytics(Request $request)
    {
        $months = $request->integer('months', 12);
        $groupBy = $request->input('group_by', 'month');

        $data = $this->analyticsService->getHistoricalTrends($months, $groupBy);
        $data['months'] = $months;
        $data['groupBy'] = $groupBy;
        $data['currency'] = \App\Models\Company::default()->currency;

        return Inertia::render('Purchasing/reports/History', $data);
    }
}
