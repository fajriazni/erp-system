<?php

namespace App\Domain\Finance\Services;

use App\Models\BankAccount;
use App\Models\BankTransaction;
use Illuminate\Support\Facades\DB;
use Exception;

use App\Domain\Accounting\Services\JournalEntryService;

class BankService
{
    public function __construct(protected JournalEntryService $journalEntryService) {}

    /**
     * Deposit funds into a bank account.
     */
    public function deposit(BankAccount $bankAccount, float $amount, string $description, ?string $reference = null, ?string $date = null): BankTransaction
    {
        return DB::transaction(function () use ($bankAccount, $amount, $description, $reference, $date) {
            $date = $date ?? now();
            
            $transaction = BankTransaction::create([
                'bank_account_id' => $bankAccount->id,
                'type' => 'deposit',
                'amount' => $amount,
                'description' => $description,
                'reference' => $reference,
                'transaction_date' => $date,
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $bankAccount->increment('current_balance', $amount);

            // GL Impact: Debit Bank (Asset), Credit Suspense/Revenue (needs defined source)
            // For general deposits without a specific source (like Sales), we often credit a Clearing or Suspense account.
            // Ideally, the caller should specify the "Source Account".
            // For simplicity in this iteration: defaulting to a "Suspense/Clearing" account or requiring it passed.
            // LIMITATION: Use a placeholder "Undeposited Funds" or "Other Income" if account not provided.
            // Ideally improved signature: deposit(..., ?int $sourceAccountId)
            
            // To fetch a dummy offset account for now (e.g., Owner's Equity or Opening Balance Equity if initial)
            // For this integrated version, let's assume:
            // Debit: Bank Account (Asset)
            // Credit: Opening Balance Equity (if opening) or Uncategorized Income.
            
            // Since we don't have sourceAccountId in signature, let's skip automatic GL for generic deposit 
            // OR find a common "Uncategorized Income" account.
            
            if ($bankAccount->chart_of_account_id) {
                // If we want complete GL integration, we really need the offset account.
                // However, automated movements usually happen from specific business events (Sales, etc).
                // "Manual Deposit" usually implies putting money in.
                // Let's create the Debit side at least? No, JE must be balanced.
                
                // DECISION: Only create JE if it's a "Transfer" (balanced known) or extended method.
                // For now, let's implement Transfer GL logic which is self-contained.
            }

            return $transaction;
        });
    }

    /**
     * Withdraw funds from a bank account.
     */
    public function withdraw(BankAccount $bankAccount, float $amount, string $description, ?string $reference = null, ?string $date = null): BankTransaction
    {
        return DB::transaction(function () use ($bankAccount, $amount, $description, $reference, $date) {
            $transaction = BankTransaction::create([
                'bank_account_id' => $bankAccount->id,
                'type' => 'withdrawal',
                'amount' => $amount,
                'description' => $description,
                'reference' => $reference,
                'transaction_date' => $date ?? now(),
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $bankAccount->decrement('current_balance', $amount);
            
            // Logic similar to deposit: Need offset account (Expense/Liability) to balance.
            
            return $transaction;
        });
    }

    /**
     * Transfer funds between two bank accounts.
     */
    public function transfer(BankAccount $fromAccount, BankAccount $toAccount, float $amount, string $description, ?string $date = null): array
    {
        return DB::transaction(function () use ($fromAccount, $toAccount, $amount, $description, $date) {
            $date = $date ?? now();
            $ref = uniqid();

            $withdrawal = BankTransaction::create([
                'bank_account_id' => $fromAccount->id,
                'type' => 'transfer_out',
                'amount' => $amount,
                'description' => "Transfer Out to {$toAccount->name}: $description",
                'reference' => 'TRF-OUT-' . $ref,
                'transaction_date' => $date,
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $fromAccount->decrement('current_balance', $amount);

            $deposit = BankTransaction::create([
                'bank_account_id' => $toAccount->id,
                'related_transaction_id' => $withdrawal->id,
                'type' => 'transfer_in',
                'amount' => $amount,
                'description' => "Transfer In from {$fromAccount->name}: $description",
                'reference' => 'TRF-IN-' . $ref,
                'transaction_date' => $date,
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $toAccount->increment('current_balance', $amount);

            $withdrawal->update(['related_transaction_id' => $deposit->id]);

            // GL Sync for Transfer
            if ($fromAccount->chart_of_account_id && $toAccount->chart_of_account_id) {
                $this->journalEntryService->createEntry(
                    'TRF-' . $ref,
                    $date,
                    "Fund Transfer: {$fromAccount->name} to {$toAccount->name}",
                    [
                        [
                            'account_id' => $toAccount->chart_of_account_id, // Debit Destination (Asset Increases)
                            'debit' => $amount,
                            'credit' => 0,
                            'description' => "Transfer In from {$fromAccount->name}"
                        ],
                        [
                            'account_id' => $fromAccount->chart_of_account_id, // Credit Source (Asset Decreases)
                            'debit' => 0,
                            'credit' => $amount,
                            'description' => "Transfer Out to {$toAccount->name}"
                        ]
                    ]
                );
            }

            return ['withdrawal' => $withdrawal, 'deposit' => $deposit];
        });
    }
}
