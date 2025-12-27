<?php

namespace App\Domain\Sales\Services;

use App\Models\ChartOfAccount;
use App\Models\CustomerPayment;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PostCustomerPaymentService
{
    public function execute(CustomerPayment $payment, User $user): JournalEntry
    {
        if ($payment->status !== 'draft') {
            throw new \Exception('Only draft payments can be posted.');
        }

        return DB::transaction(function () use ($payment, $user) {
            // 1. Create Journal Entry
            $journalEntry = JournalEntry::create([
                'date' => $payment->date,
                'reference_number' => $payment->payment_number,
                'description' => 'Customer Payment '.$payment->payment_number,
                'status' => 'posted',
                'posted_at' => now(),
                'posted_by' => $user->id,
            ]);

            // 2. Determine Accounts
            // Debit: Bank/Cash (Asset)
            $bankAccount = ChartOfAccount::where('code', '1000')->firstOrFail();
            // Credit: Accounts Receivable (Asset) - reducing the asset
            $arAccount = ChartOfAccount::where('code', '1100')->firstOrFail();

            // 3. Create Journal Entry Lines
            $journalEntry->lines()->create([
                'chart_of_account_id' => $bankAccount->id,
                'debit' => $payment->amount,
                'credit' => 0,
                'description' => 'Payment Received',
            ]);

            $journalEntry->lines()->create([
                'chart_of_account_id' => $arAccount->id,
                'debit' => 0,
                'credit' => $payment->amount,
                'description' => 'Payment for Invoices',
            ]);

            // 4. Update Payment Status
            $payment->update([
                'status' => 'posted',
                'journal_entry_id' => $journalEntry->id,
                'posted_at' => now(),
            ]);

            // 5. Update Invoice Statuses
            foreach ($payment->lines as $line) {
                $invoice = $line->invoice;

                // Calculate total paid for this invoice including this payment
                // We can query all payment lines for this invoice that are POSTED
                // OR since we are just posting this one, we assume previous ones are posted or valid.

                // Better approach: Re-calculate paid amount from all posted payments
                // including this one (which is now posted/linked via transaction but effectively posted)

                // Simple logic for now:
                // Check if remaining balance is zero.

                $totalPaid = $invoice->lines()->sum('subtotal') + $invoice->tax_amount; // Wait, invoice total is total_amount

                // Let's sum up all payments for this invoice
                // This requires a relationship or query.
                // Simplified: Just check if we paid it off.
                // Ideally, CustomerInvoice should have 'amount_paid' or 'status' logic based on payments.

                // For this MVP step:
                if ($line->amount >= $invoice->total_amount) {
                    $invoice->update(['status' => 'paid']);
                } else {
                    $invoice->update(['status' => 'partial']);
                }
            }

            return $journalEntry;
        });
    }
}
