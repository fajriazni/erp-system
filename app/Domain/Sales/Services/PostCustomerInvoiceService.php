<?php

namespace App\Domain\Sales\Services;

use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Models\ChartOfAccount;
use App\Models\CustomerInvoice;
use Exception;
use Illuminate\Support\Facades\DB;

class PostCustomerInvoiceService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService,
        protected \App\Domain\Finance\Services\PostJournalEntryService $postJournalEntryService
    ) {}

    public function execute(CustomerInvoice $invoice, \App\Models\User $user): void
    {
        if ($invoice->status !== 'draft') {
            throw new Exception('Only draft invoices can be posted.');
        }

        DB::transaction(function () use ($invoice, $user) {
            $invoice->update([
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            // Resolve Accounts
            // TODO: In the future, these should be configurable settings
            $arAccount = ChartOfAccount::where('code', '1100')->firstOrFail(); // Accounts Receivable (Piutang Usaha)
            $salesAccount = ChartOfAccount::where('code', '4000')->firstOrFail(); // Sales (Penjualan)
            $outputTaxAccount = ChartOfAccount::where('code', '2300')->first(); // Output Tax (PPN Keluaran) - Code might differ, assuming 2300

            // Prepare Journal Entry Lines
            $lines = [];

            // 1. Debit AR (Total Amount)
            $lines[] = [
                'chart_of_account_id' => $arAccount->id,
                'debit' => $invoice->total_amount,
                'credit' => 0,
            ];

            // 2. Credit Sales (Subtotal)
            $lines[] = [
                'chart_of_account_id' => $salesAccount->id,
                'debit' => 0,
                'credit' => $invoice->subtotal,
            ];

            // 3. Credit Output Tax (Tax Amount)
            if ($invoice->tax_amount > 0) {
                if (! $outputTaxAccount) {
                    // Fallback or error if tax account missing.
                    // Ideally we should fail hard or have a default 'Tax Pending' account.
                    // For now, let's assume if it's missing but tax exists, we throw exception
                    throw new Exception('Output Tax Account (2300) is missing in Chart of Accounts.');
                }

                $lines[] = [
                    'chart_of_account_id' => $outputTaxAccount->id,
                    'debit' => 0,
                    'credit' => $invoice->tax_amount,
                ];
            }

            // Create Journal Entry
            $journalEntry = $this->createJournalEntryService->execute(
                \Carbon\Carbon::parse($invoice->date)->format('Y-m-d'),
                $invoice->invoice_number,
                "Customer Invoice #{$invoice->invoice_number} - {$invoice->customer->name}",
                $lines,
                $user
            );

            // Post Journal Entry
            $this->postJournalEntryService->execute($journalEntry, $user);

            // Link Journal Entry to Invoice
            $invoice->update(['journal_entry_id' => $journalEntry->id]);
        });
    }
}
