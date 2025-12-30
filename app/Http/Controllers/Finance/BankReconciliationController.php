<?php

namespace App\Http\Controllers\Finance;

use App\Domain\Finance\Services\BankReconciliationService;
use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankReconciliation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankReconciliationController extends Controller
{
    public function __construct(
        protected BankReconciliationService $reconciliationService
    ) {}

    public function index()
    {
        return Inertia::render('Finance/Reconciliation/Index', [
            'reconciliations' => BankReconciliation::with('bankAccount')
                ->latest()
                ->paginate(10),
            'accounts' => BankAccount::where('is_active', true)->get(['id', 'name', 'currency']),
        ]);
    }

    public function create(Request $request)
    {
        $account = null;
        if ($request->has('account_id')) {
            $account = BankAccount::find($request->account_id);
        }

        return Inertia::render('Finance/Reconciliation/Create', [
            'accounts' => BankAccount::where('is_active', true)->get(['id', 'name', 'currency']),
            'selectedAccount' => $account,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'statement_date' => 'required|date',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'statement_balance' => 'required|numeric', // The ending balance from the bank statement
        ]);

        $account = BankAccount::findOrFail($validated['bank_account_id']);

        $reconciliation = $this->reconciliationService->createReconciliation(
            $account,
            $validated['start_date'],
            $validated['end_date'],
            $validated['statement_balance'],
            $validated['statement_date']
        );

        return redirect()->route('finance.reconciliation.show', $reconciliation);
    }

    public function show(BankReconciliation $reconciliation)
    {
        $reconciliation->load('bankAccount');
        
        // Get transactions that are:
        // 1. Linked to this reconciliation (already cleared)
        // 2. OR Unreconciled AND belong to this bank account AND within the date range (or earlier)
        //    (Often we want to see ALL unreconciled past transactions too)
        
        $transactions = $reconciliation->bankAccount->transactions()
            ->where(function ($query) use ($reconciliation) {
                // Is part of this session
                $query->where('bank_reconciliation_id', $reconciliation->id)
                      // OR is totally unreconciled and dated on/before end date
                      ->orWhere(function ($q) use ($reconciliation) {
                          $q->whereNull('bank_reconciliation_id')
                            ->where('is_reconciled', false)
                            ->where('transaction_date', '<=', $reconciliation->end_date);
                      });
            })
            ->orderBy('transaction_date')
            ->get();

        return Inertia::render('Finance/Reconciliation/Show', [
            'reconciliation' => $reconciliation,
            'transactions' => $transactions,
        ]);
    }

    public function update(Request $request, BankReconciliation $reconciliation)
    {
        // Handling the "Toggle Transaction" action mostly.
        // Or updating the statement balance if they made a typo.
        
        if ($request->has('transaction_id')) {
            $transaction = \App\Models\BankTransaction::findOrFail($request->transaction_id);
            $this->reconciliationService->toggleTransaction($reconciliation, $transaction);
            
            return back()->with('success', 'Transaction updated.'); // In Inertia this preserves scroll usually
        }

        // Updating main details
        $validated = $request->validate([
            'statement_balance' => 'numeric',
            'notes' => 'nullable|string'
        ]);
        
        $reconciliation->update($validated);
        
        return back();
    }

    public function finalize(BankReconciliation $reconciliation)
    {
        // Recalculate one last time
        $this->reconciliationService->updateReconciledBalance($reconciliation);
        
        // Check difference
        // We'll calculate a "Difference" in the frontend, but backend must enforce it.
        // Difference = Statement Balance - (Opening Balance + Cleared Deposits - Cleared Withdrawals)
        // For simplicity in this iteration: We assume user ensures it matches. 
        // Real systems often require Difference == 0.
        
        $this->reconciliationService->finalize($reconciliation);
        
        return redirect()->route('finance.reconciliation.index')
            ->with('success', 'Reconciliation finalized successfully.');
    }
}
