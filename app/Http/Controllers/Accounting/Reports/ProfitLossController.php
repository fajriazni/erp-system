<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Application\Services\Accounting\Reports\ProfitLossService;
use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfitLossController extends Controller
{
    public function __construct(
        private readonly ProfitLossService $service
    ) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'period_id' => 'nullable|exists:accounting_periods,id',
            'comparative' => 'nullable|boolean',
        ]);

        $periods = AccountingPeriod::orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date', 'status']);

        $reportData = null;
        if ($request->has('start_date')) {
            $reportData = $this->service->getProfitLoss(
                $validated['start_date'] ?? null,
                $validated['end_date'] ?? null
            );
        }

        return Inertia::render('Accounting/Reports/ProfitLoss', [
            'periods' => $periods,
            'filters' => $validated,
            'reportData' => $reportData,
        ]);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'format' => 'required|in:pdf,excel',
        ]);

        $reportData = $this->service->getProfitLoss(
            $validated['start_date'] ?? null,
            $validated['end_date'] ?? null
        );

        // TODO: Implement PDF/Excel export
        return response()->json($reportData);
    }
}
