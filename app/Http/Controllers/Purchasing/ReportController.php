<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\Stats\GetPayableAgingService;
use App\Domain\Purchasing\Services\Stats\GetSpendAnalysisService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
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
}
