<?php

namespace App\Http\Controllers\Finance;

use App\Domain\Finance\Services\ExpenseService;
use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\ExpenseClaim;
use App\Models\ExpenseItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ExpenseClaimController extends Controller
{
    public function __construct(protected ExpenseService $service) {}

    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Scope logic:
        // - Regular users see their own.
        // - Finance/Approvers (simplification for now: based on permission or role check if implemented)
        // For this implementation, let's say "view_all_expenses" permission is needed, else only own.
        // Assuming current simple setup: 
        
        $query = ExpenseClaim::with(['user', 'department', 'items'])
             ->orderByDesc('created_at');

        // Simple filter tab logic
        if ($request->tab === 'approval') {
             // Show submitted claims from OTHERS
             $query->where('status', 'submitted');
                 // ->where('user_id', '!=', $user->id); // Optional: can you approve your own? usually no.
        } else {
             // My claims
             $query->where('user_id', $user->id);
        }

        return Inertia::render('Finance/Expenses/Reimbursements/Index', [
            'claims' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['tab']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Finance/Expenses/Reimbursements/Create', [
            'departments' => Department::where('is_active', true)->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'description' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.date' => 'required|date',
            'items.*.category' => 'required|string',
            'items.*.description' => 'required|string',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        $claim = ExpenseClaim::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'department_id' => $validated['department_id'],
            'description' => $validated['description'],
            'status' => 'draft',
        ]);

        $total = 0;
        foreach ($validated['items'] as $itemData) {
            $claim->items()->create($itemData);
            $total += $itemData['amount'];
        }

        $claim->update(['total_amount' => $total]);

        // Auto-submit if requested? For now, keep as draft or separate submit action.
        // Let's redirect to show page where they can submit.

        return redirect()->route('finance.expenses.reimbursements.show', $claim)
            ->with('success', 'Expense claim created successfully.');
    }

    public function show(ExpenseClaim $reimbursement)
    {
        $reimbursement->load(['user', 'department', 'items', 'approver']);
        
        return Inertia::render('Finance/Expenses/Reimbursements/Show', [
            'claim' => $reimbursement,
            'can_approve' => $reimbursement->status === 'submitted', // Simplified permission
        ]);
    }

    public function submit(ExpenseClaim $reimbursement)
    {
        if ($reimbursement->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        try {
            $this->service->submit($reimbursement);
            return back()->with('success', 'Claim submitted for approval.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function approve(ExpenseClaim $reimbursement)
    {
        // $this->authorize('approve', $reimbursement);
        
        try {
            $this->service->approve($reimbursement, auth()->user());
            return back()->with('success', 'Claim approved.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function reject(Request $request, ExpenseClaim $reimbursement)
    {
        $request->validate(['reason' => 'required|string']);
        
        try {
            $this->service->reject($reimbursement, auth()->user(), $request->reason);
            return back()->with('success', 'Claim rejected.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
    public function pay(ExpenseClaim $reimbursement)
    {
        // MVP: Automatically select the first active Bank Account
        $bankAccount = \App\Models\BankAccount::where('is_active', true)
            ->where('type', 'bank')
            ->first();
            
        if (!$bankAccount) {
            return back()->with('error', 'No active bank account found to process payment.');
        }

        try {
            $this->service->pay($reimbursement, $bankAccount);
            return back()->with('success', 'Claim paid and recorded.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
