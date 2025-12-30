<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $accounts = BankAccount::bank() // Use scopeBank
            ->with(['chartOfAccount'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('bank_name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Finance/Treasury/Index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Finance/Treasury/Create', [
            // Filter only Asset accounts (usually Bank/Cash type, but for now showing all or assets)
            'coas' => ChartOfAccount::where('is_active', true)
                                    ->where(function($q) {
                                         $q->where('type', 'asset')->orWhere('code', 'like', '1%'); // Assumption: Assets allow Bank
                                    })
                                    ->orderBy('code')
                                    ->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'currency' => 'required|string|size:3',
            'opening_balance' => 'required|numeric',
            'current_balance' => 'required|numeric', // Usually equal to opening balance initially
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'type' => 'nullable|string|in:bank,cash,credit_card,ewallet',
        ]);

        $validated['type'] = $validated['type'] ?? BankAccount::TYPE_BANK;
        
        BankAccount::create($validated);

        return redirect()->route('finance.treasury.index')
            ->with('success', 'Bank account created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(BankAccount $bankAccount)
    {
        $bankAccount->load(['transactions' => function ($query) {
            $query->latest('transaction_date')->limit(50);
        }]);

        return Inertia::render('Finance/Treasury/Show', [
            'account' => $bankAccount,
        ]);
    }
    
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BankAccount $bankAccount)
    {
        return Inertia::render('Finance/Treasury/Edit', [
             'account' => $bankAccount,
             'coas' => ChartOfAccount::where('is_active', true)
                                    ->where(function($q) {
                                         $q->where('type', 'asset')->orWhere('code', 'like', '1%');
                                    })
                                    ->orderBy('code')
                                    ->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
     public function update(Request $request, BankAccount $bankAccount)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'currency' => 'required|string|size:3',
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $bankAccount->update($validated);

        return redirect()->route('finance.treasury.index')
            ->with('success', 'Bank account updated successfully.');
    }
}
