<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Application\Services\Accounting\Reports\GeneralLedgerService;
use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeneralLedgerController extends Controller
{
    public function __construct(
        private readonly GeneralLedgerService $service
    ) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'period_id' => 'nullable|exists:accounting_periods,id',
        ]);

        $accounts = ChartOfAccount::select(['id', 'code', 'name', 'type'])
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        $periods = AccountingPeriod::select(['id', 'name', 'start_date', 'end_date', 'status'])
            ->orderByDesc('start_date')
            ->get();

        // Get report data only if filters are applied
        $reportData = null;
        if ($request->filled('account_id') && $request->filled('start_date')) {
            try {
                $reportData = $this->service->getGeneralLedger(
                    $validated['account_id'] ?? null,
                    $validated['start_date'] ?? null,
                    $validated['end_date'] ?? null,
                    $validated['period_id'] ?? null
                );
            } catch (\Exception $e) {
                \Log::error('General Ledger Error: '.$e->getMessage());

                // Return error to user
                return back()->withErrors(['error' => 'Error generating report: '.$e->getMessage()]);
            }
        }

        return Inertia::render('Accounting/Reports/GeneralLedger', [
            'accounts' => $accounts,
            'periods' => $periods,
            'filters' => $validated,
            'reportData' => $reportData,
        ]);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'period_id' => 'nullable|exists:accounting_periods,id',
            'format' => 'required|in:pdf,excel',
        ]);

        $reportData = $this->service->getGeneralLedger(
            $validated['account_id'] ?? null,
            $validated['start_date'] ?? null,
            $validated['end_date'] ?? null,
            $validated['period_id'] ?? null
        );

        // TODO: Implement PDF/Excel export
        // For now, return JSON
        return response()->json($reportData);
    }
}
