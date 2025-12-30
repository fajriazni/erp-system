<?php

namespace App\Http\Controllers\Finance;

use App\Domain\Finance\Services\BankService;
use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;

class BankTransactionController extends Controller
{
    public function __construct(
        protected BankService $bankService
    ) {}

    /**
     * Store a new transaction (Deposit/Withdrawal).
     */
    public function store(Request $request, BankAccount $bankAccount)
    {
        $validated = $request->validate([
            'type' => 'required|in:deposit,withdrawal',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'reference' => 'nullable|string|max:50',
            'transaction_date' => 'nullable|date',
        ]);

        if ($validated['type'] === 'deposit') {
            $this->bankService->deposit(
                $bankAccount,
                $validated['amount'],
                $validated['description'],
                $validated['reference'] ?? null,
                $validated['transaction_date']
            );
        } else {
            $this->bankService->withdraw(
                $bankAccount,
                $validated['amount'],
                $validated['description'],
                $validated['reference'] ?? null,
                $validated['transaction_date']
            );
        }

        return redirect()->back()->with('success', 'Transaction recorded successfully.');
    }

    /**
     * Transfer funds between accounts.
     */
    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'from_account_id' => 'required|exists:bank_accounts,id',
            'to_account_id' => 'required|exists:bank_accounts,id|different:from_account_id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'nullable|date',
        ]);

        $fromAccount = BankAccount::findOrFail($validated['from_account_id']);
        $toAccount = BankAccount::findOrFail($validated['to_account_id']);

        $this->bankService->transfer(
            $fromAccount,
            $toAccount,
            $validated['amount'],
            $validated['description'],
            $validated['transaction_date']
        );

        return redirect()->back()->with('success', 'Funds transferred successfully.');
    }
}
