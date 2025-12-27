<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Application\Services\Accounting\Reports\BalanceSheetService;
use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BalanceSheetController extends Controller
{
    public function __construct(
        private readonly BalanceSheetService $service
    ) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'as_of_date' => 'nullable|date',
            'comparative' => 'nullable|boolean',
            'dates' => 'nullable|array',
            'dates.*' => 'date',
        ]);

        $periods = AccountingPeriod::select(['id', 'name', 'start_date', 'end_date', 'status'])
            ->orderByDesc('start_date')
            ->get();

        $reportData = null;
        if ($request->has('as_of_date')) {
            if ($validated['comparative'] ?? false) {
                $dates = $validated['dates'] ?? [];
                $reportData = $this->service->getComparativeBalanceSheet(
                    $dates[0] ?? $validated['as_of_date'],
                    $dates[1] ?? now()->format('Y-m-d'),
                    $dates[2] ?? null
                );
                $reportData['is_comparative'] = true;
            } else {
                $reportData = $this->service->getBalanceSheet($validated['as_of_date'] ?? null);
                $reportData['is_comparative'] = false;
            }
        }

        \Log::info('Balance Sheet Controller Data', [
            'periods_count' => $periods->count(),
            'periods_sample' => $periods->take(2)->toArray(),
            'has_report_data' => $reportData !== null,
        ]);

        return Inertia::render('Accounting/Reports/BalanceSheet', [
            'periods' => $periods,
            'filters' => $validated,
            'reportData' => $reportData,
        ]);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'as_of_date' => 'nullable|date',
            'format' => 'required|in:pdf,excel',
        ]);

        $reportData = $this->service->getBalanceSheet($validated['as_of_date'] ?? null);

        // TODO: Implement PDF/Excel export
        return response()->json($reportData);
    }
}
