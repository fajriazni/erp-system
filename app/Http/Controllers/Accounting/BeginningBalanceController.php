<?php

namespace App\Http\Controllers\Accounting;

use App\Application\Commands\SetBeginningBalanceService;
use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BeginningBalanceController extends Controller
{
    public function __construct(
        private readonly SetBeginningBalanceService $service
    ) {}

    public function create()
    {
        return Inertia::render('Accounting/Openings/BeginningBalance', [
            'chartOfAccounts' => ChartOfAccount::where('is_active', true)->orderBy('code')->get(),
            'periods' => AccountingPeriod::where('status', 'open')->orderByDesc('start_date')->get(),
            'existingBalances' => \App\Models\JournalEntry::with(['lines.chartOfAccount'])
                ->where('description', 'like', '%Beginning Balance%')
                ->orderByDesc('date')
                ->get()
                ->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'date' => $entry->date->format('Y-m-d'),
                        'description' => $entry->description,
                        'status' => $entry->status,
                        'total_debit' => $entry->lines->sum('debit'),
                        'total_credit' => $entry->lines->sum('credit'),
                        'lines_count' => $entry->lines->count(),
                    ];
                }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'balances' => 'required|array',
            'balances.*.chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'balances.*.amount' => 'required|numeric',
            'balances.*.type' => 'required|in:debit,credit',
        ]);

        try {
            $this->service->execute(
                $validated['date'],
                $validated['balances']
            );

            return redirect()->route('accounting.journal-entries.index')
                ->with('success', 'Beginning balances set successfully.');
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
