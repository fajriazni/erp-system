<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Application\Services\Accounting\Reports\CashFlowService;
use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashFlowController extends Controller
{
    public function __construct(
        private readonly CashFlowService $service
    ) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'period_id' => 'nullable|exists:accounting_periods,id',
        ]);

        $periods = AccountingPeriod::orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date', 'status']);

        $reportData = null;
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $reportData = $this->service->getCashFlow(
                $validated['start_date'],
                $validated['end_date']
            );
        }

        return Inertia::render('Accounting/Reports/CashFlow', [
            'periods' => $periods,
            'filters' => $validated,
            'reportData' => $reportData,
        ]);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'required|in:pdf,excel',
        ]);

        $reportData = $this->service->getCashFlow(
            $validated['start_date'],
            $validated['end_date']
        );

        // TODO: Implement PDF/Excel export
        return response()->json($reportData);
    }
}
