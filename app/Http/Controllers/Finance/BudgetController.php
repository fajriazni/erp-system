<?php

namespace App\Http\Controllers\Finance;

use App\Domain\Finance\Services\BudgetCheckService;
use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\ChartOfAccount;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $budgets = Budget::with(['department', 'account'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('department', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->when($request->fiscal_year, fn ($q, $year) => $q->where('fiscal_year', $year))
            ->orderBy('fiscal_year', 'desc')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Finance/budgets/index', [
            'budgets' => $budgets,
            'filters' => $request->only(['search', 'fiscal_year']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Finance/budgets/form', [
            'departments' => Department::where('is_active', true)->get(['id', 'name', 'code']),
            'accounts' => ChartOfAccount::orderBy('code')->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'fiscal_year' => 'required|integer|min:2020|max:2100',
            'period_type' => 'required|in:annual,quarterly,monthly',
            'period_number' => 'required|integer|min:1|max:12',
            'amount' => 'required|numeric|min:0',
            'warning_threshold' => 'required|numeric|min:0|max:100',
            'is_strict' => 'boolean',
        ]);

        Budget::create($validated);

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $budget)
    {
        $budget->load(['department', 'account', 'encumbrances.encumberable']);

        return Inertia::render('Finance/budgets/show', [
            'budget' => $budget,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Budget $budget)
    {
        return Inertia::render('Finance/budgets/form', [
            'budget' => $budget->load(['department', 'account']),
            'departments' => Department::where('is_active', true)->get(['id', 'name', 'code']),
            'accounts' => ChartOfAccount::orderBy('code')->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Budget $budget)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'fiscal_year' => 'required|integer|min:2020|max:2100',
            'period_type' => 'required|in:annual,quarterly,monthly',
            'period_number' => 'required|integer|min:1|max:12',
            'amount' => 'required|numeric|min:0',
            'warning_threshold' => 'required|numeric|min:0|max:100',
            'is_strict' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $budget->update($validated);

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget)
    {
        $budget->delete();

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget deleted successfully.');
    }

    /**
     * API: Check budget availability for a department.
     */
    public function checkBudget(Request $request, BudgetCheckService $service)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'amount' => 'required|numeric|min:0',
        ]);

        $result = $service->check(
            $request->department_id,
            $request->amount
        );

        return response()->json($result->toArray());
    }
}
