<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Application\Services\Accounting\Reports\TrialBalanceService;
use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrialBalanceController extends Controller
{
    public function __construct(
        private readonly TrialBalanceService $service
    ) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'as_of_date' => 'nullable|date',
            'period_id' => 'nullable|exists:accounting_periods,id',
            'comparative' => 'nullable|boolean',
            'dates' => 'nullable|array',
            'dates.*' => 'date',
        ]);

        $periods = AccountingPeriod::orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date', 'status']);

        $reportData = null;
        if ($request->has('as_of_date')) {
            if ($validated['comparative'] ?? false) {
                $dates = $validated['dates'] ?? [];
                $reportData = $this->service->getComparativeTrialBalance(
                    $dates[0] ?? $validated['as_of_date'],
                    $dates[1] ?? now()->format('Y-m-d'),
                    $dates[2] ?? null
                );
                $reportData['is_comparative'] = true;
            } else {
                $reportData = $this->service->getTrialBalance(
                    $validated['as_of_date'] ?? null,
                    $validated['period_id'] ?? null
                );
                $reportData['is_comparative'] = false;
            }
        }

        return Inertia::render('Accounting/Reports/TrialBalance', [
            'periods' => $periods,
            'filters' => $validated,
            'reportData' => $reportData,
        ]);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'as_of_date' => 'nullable|date',
            'period_id' => 'nullable|exists:accounting_periods,id',
            'comparative' => 'nullable|boolean',
            'dates' => 'nullable|array',
            'dates.*' => 'date',
            'format' => 'required|in:pdf,excel',
        ]);

        $reportData = null;
        $isComparative = false;

        if ($validated['comparative'] ?? false) {
            $dates = $validated['dates'] ?? [];
            $reportData = $this->service->getComparativeTrialBalance(
                $dates[0] ?? $validated['as_of_date'],
                $dates[1] ?? now()->format('Y-m-d'),
                $dates[2] ?? null
            );
            $isComparative = true;
        } else {
            $reportData = $this->service->getTrialBalance(
                $validated['as_of_date'] ?? null,
                $validated['period_id'] ?? null
            );
        }

        $fileName = 'trial_balance_' . now()->format('Ymd_His') . '.xlsx';
        
        // Use Excel for both pdf and excel requests for now (PDF requires dompdf)
        // If user requested PDF but we don't have it set up, fallback to Excel or generic download
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\Accounting\Reports\TrialBalanceExport($reportData, $isComparative), 
            $fileName
        );
    }
}
