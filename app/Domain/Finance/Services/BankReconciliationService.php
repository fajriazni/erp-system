<?php

namespace App\Domain\Finance\Services;

use App\Models\BankAccount;
use App\Models\BankReconciliation;
use App\Models\BankTransaction;
use Illuminate\Support\Facades\DB;
use Exception;

class BankReconciliationService
{
    /**
     * Create a new draft reconciliation.
     */
    public function createReconciliation(
        BankAccount $bankAccount,
        string $startDate,
        string $endDate,
        float $statementBalance,
        string $statementDate
    ): BankReconciliation {
        // Validation: Check if there's already an active draft for this account?
        // For now, allow multiple drafts but ideally strictly sequential.

        return BankReconciliation::create([
            'bank_account_id' => $bankAccount->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'statement_balance' => $statementBalance,
            'statement_date' => $statementDate,
            'status' => 'draft',
            'reconciled_balance' => 0,
        ]);
    }

    /**
     * Update the reconciliation draft (e.g. balance or dates).
     */
    public function updateReconciliation(BankReconciliation $reconciliation, array $data): BankReconciliation
    {
        $reconciliation->update($data);
        return $reconciliation;
    }

    /**
     * Toggle a transaction's reconciliation status within a draft key.
     * In this simple version, we link the transaction to the reconciliation ID.
     */
    public function toggleTransaction(BankReconciliation $reconciliation, BankTransaction $transaction): void
    {
        if ($transaction->bank_account_id !== $reconciliation->bank_account_id) {
            throw new Exception("Transaction belongs to a different account.");
        }

        if ($transaction->bank_reconciliation_id === $reconciliation->id) {
            // Unlink it
            $transaction->update([
                'bank_reconciliation_id' => null,
                'is_reconciled' => false,
            ]);
        } else {
            // Link it (if not already linked to another finalized one)
            if ($transaction->is_reconciled && $transaction->bank_reconciliation_id !== $reconciliation->id) {
                 throw new Exception("Transaction is already reconciled in another session.");
            }

            $transaction->update([
                'bank_reconciliation_id' => $reconciliation->id,
                'is_reconciled' => false, // Only set to true on finalize
            ]);
        }
        
        $this->updateReconciledBalance($reconciliation);
    }

    /**
     * Recalculate and save the reconciled balance based on linked transactions.
     */
    public function updateReconciledBalance(BankReconciliation $reconciliation): void
    {
        // Sum of all linked transactions (deposits + withdrawals)
        // Note: Logic depends on how you store amounts. Assuming deposits + and withdrawal - in amount?
        // Or if amount is always positive and type distinguishes.
        
        $balance = $reconciliation->transactions()
            ->get()
            ->reduce(function ($carry, $trx) {
                if ($trx->type === 'deposit' || $trx->type === 'transfer_in') {
                    return $carry + $trx->amount;
                } else {
                    return $carry - $trx->amount;
                }
            }, 0);

        // Add Opening Balance? 
        // Typically: Statement Ending Balance = Adjusted Book Balance.
        // Reconciled Balance usually means: Beginning Book Balance + Cleared Deposits - Cleared Withdrawals.
        
        // Let's assume we just store the sum of cleared transactions for now to compare against (Statement - Opening).
        // Or simpler: Reconciled Balance = Sum of all cleared transactions + Opening Balance of the period.
        
        $reconciliation->update(['reconciled_balance' => $balance]);
    }

    /**
     * Finalize the reconciliation.
     */
    public function finalize(BankReconciliation $reconciliation): void
    {
        // 1. Verify Difference is Zero (Implementation detail: Frontend checks, Backend double checks)
        // For flexible design, maybe we allow small write-offs? For now, strict.
        
        // 2. Lock transactions
        $reconciliation->transactions()->update([
            'is_reconciled' => true,
            'reconciled_at' => now(),
        ]);

        // 3. Update status
        $reconciliation->update(['status' => 'reconciled']);
    }
}
