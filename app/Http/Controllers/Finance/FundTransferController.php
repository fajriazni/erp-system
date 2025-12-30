<?php

namespace App\Http\Controllers\Finance;

use App\Domain\Finance\Services\BankService;
use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FundTransferController extends Controller
{
    public function index()
    {
        $transfers = BankTransaction::where('type', 'transfer_out')
            ->with(['bankAccount', 'relatedTransaction.bankAccount'])
            ->latest('transaction_date')
            ->paginate(20);

        return Inertia::render('Finance/Transfer/Index', [
            'transfers' => $transfers,
            'accounts' => BankAccount::where('is_active', true)->get(['id', 'name', 'currency', 'current_balance']),
        ]);
    }

    public function store(Request $request, BankService $bankService)
    {
        $validated = $request->validate([
            'from_account_id' => 'required|exists:bank_accounts,id',
            'to_account_id' => 'required|exists:bank_accounts,id|different:from_account_id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'date' => 'nullable|date',
        ]);

        $fromAccount = BankAccount::findOrFail($validated['from_account_id']);
        $toAccount = BankAccount::findOrFail($validated['to_account_id']);

        if ($fromAccount->currency !== $toAccount->currency) {
            return back()->withErrors(['to_account_id' => 'Multi-currency transfers are not yet supported.']);
        }

        if ($fromAccount->current_balance < $validated['amount']) {
             return back()->withErrors(['amount' => 'Insufficient funds in source account.']);
        }

        $bankService->transfer(
            $fromAccount,
            $toAccount,
            $validated['amount'],
            $validated['description'],
            $validated['date'] ?? now()
        );

        return redirect()->route('finance.transfer.index')->with('success', 'Transfer completed successfully.');
    }
}
