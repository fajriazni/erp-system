<?php

namespace App\Domain\Finance\Services;

use App\Models\ExpenseClaim;
use App\Models\User;
use Illuminate\Support\Facades\DB;

use App\Domain\Accounting\Services\JournalEntryService;
use App\Models\BankAccount; // Assuming we pay from a default or selected bank account

class ExpenseService
{
    public function __construct(
        protected JournalEntryService $journalEntryService,
        // protected BankService $bankService // Optional, if we want to reuse bank logic
    ) {}

    // ... submit / approve / reject methods remain unchanged ...
    
    /**
     * Submit a draft claim for approval.
     */
    public function submit(ExpenseClaim $claim): ExpenseClaim
    {
        if ($claim->status !== 'draft') {
            throw new \Exception("Only draft claims can be submitted.");
        }

        if ($claim->items()->count() === 0) {
            throw new \Exception("Cannot submit an empty claim.");
        }

        // Auto-calculate total just in case
        $claim->total_amount = $claim->items()->sum('amount');
        $claim->status = 'submitted';
        $claim->save();

        return $claim;
    }

    /**
     * Approve a claim.
     */
    public function approve(ExpenseClaim $claim, User $approver): ExpenseClaim
    {
        if ($claim->status !== 'submitted') {
            throw new \Exception("Claim is not in submitted state.");
        }

        $claim->status = 'approved';
        $claim->approver_id = $approver->id;
        $claim->processed_at = now();
        $claim->rejection_reason = null;
        $claim->save();

        return $claim;
    }

    /**
     * Reject a claim.
     */
    public function reject(ExpenseClaim $claim, User $rejector, string $reason): ExpenseClaim
    {
        if ($claim->status !== 'submitted') {
            throw new \Exception("Claim is not in submitted state.");
        }

        $claim->status = 'rejected';
        $claim->approver_id = $rejector->id;
        $claim->processed_at = now();
        $claim->rejection_reason = $reason;
        $claim->save();

        return $claim;
    }

    /**
     * Mark a claim as paid.
     * 
     * @param ExpenseClaim $claim
     * @param BankAccount $bankAccount The source account for payment
     * @return ExpenseClaim
     */
    public function pay(ExpenseClaim $claim, BankAccount $bankAccount): ExpenseClaim
    {
        if ($claim->status !== 'approved') {
            throw new \Exception("Only approved claims can be paid.");
        }

        return DB::transaction(function () use ($claim, $bankAccount) {
            $claim->status = 'paid';
            $claim->payment_date = now();
            $claim->save();
            
            // 1. Create Bank Withdrawal (Using BankService logic manually here to avoid circular dep or complexity)
            // Or ideally use BankService->withdraw() but let's keep it simple for now or inject BankService.
            
            $ref = 'EXP-' . $claim->id;
            
            $bankAccount->transactions()->create([
                'type' => 'withdrawal',
                'amount' => $claim->total_amount,
                'description' => "Expense Payment: {$claim->title}",
                'reference' => $ref,
                'transaction_date' => now(),
                'status' => 'posted',
                'posted_at' => now(),
            ]);
            $bankAccount->decrement('current_balance', $claim->total_amount);

            // 2. Create Journal Entry
            // Debit: Expense Account (From Logic: Department Cost Center OR Category lookup)
            // Credit: Bank Account (Asset)
            
            // For now, let's assume a default "General Expense" account if mapped, 
            // or we need to add 'chart_of_account_id' to ExpenseItem categories. 
            // LIMITATION: Hardcoding logic or finding "Expense" account.
            // Assumption: We need a valid expense account ID. Fetching first 'Expense' type account for MVP.
            
            $expenseAccount = \App\Models\ChartOfAccount::where('type', 'expense')->first();
            
            if ($expenseAccount && $bankAccount->chart_of_account_id) {
                $this->journalEntryService->createEntry(
                    $ref,
                    now(),
                    "Expense Payment: {$claim->title}",
                    [
                        [
                            'account_id' => $expenseAccount->id, // Debit Expense
                            'debit' => $claim->total_amount,
                            'credit' => 0,
                            'description' => $claim->title
                        ],
                        [
                            'account_id' => $bankAccount->chart_of_account_id, // Credit Bank
                            'debit' => 0,
                            'credit' => $claim->total_amount,
                            'description' => "Payment for {$claim->title}"
                        ]
                    ]
                );
            }

            return $claim;
        });
    }
}
