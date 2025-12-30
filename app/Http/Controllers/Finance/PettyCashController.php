<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashController extends Controller
{
    public function index()
    {
        return Inertia::render('Accounting/Bank/PettyCash', [
            'accounts' => BankAccount::cash()
                ->with('chartOfAccount')
                ->latest()
                ->get(),
        ]);
    }

    public function show(BankAccount $pettyCash)
    {
        // Ensure it is a cash account
        if ($pettyCash->type !== BankAccount::TYPE_CASH) {
            abort(404);
        }

        return Inertia::render('Finance/Treasury/Show', [
            'account' => $pettyCash->load(['transactions' => function ($query) {
                $query->latest()->limit(50);
            }]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'opening_balance' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
        ]);

        $validated['type'] = BankAccount::TYPE_CASH;
        $validated['bank_name'] = 'Cash Drawer'; // Default for petty cash
        $validated['account_number'] = 'PC-' . strtoupper(uniqid()); // Generate dummy number or allow user input if needed

        BankAccount::create($validated);

        return redirect()->back()->with('success', 'Petty Cash account created.');
    }
}
