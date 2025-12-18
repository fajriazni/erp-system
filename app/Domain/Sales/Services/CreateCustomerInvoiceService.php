<?php

namespace App\Domain\Sales\Services;

use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Domain\Finance\Services\TaxCalculationService;
use App\Models\ChartOfAccount;
use App\Models\CustomerInvoice;
use App\Models\CustomerInvoiceLine;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreateCustomerInvoiceService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService,
        protected TaxCalculationService $taxCalculationService
    ) {}

    public function execute(array $data): CustomerInvoice
    {
        return DB::transaction(function () use ($data) {
            // 1. Calculate Tax
            $itemsTotal = 0;
            foreach ($data['items'] as $item) {
                $itemsTotal += $item['quantity'] * $item['unit_price'];
            }

            $taxCalc = $this->taxCalculationService->calculatePurchaseTax( // Reusing tax calc logic, math is same
                $itemsTotal,
                $data['tax_rate'] ?? 0,
                0, // No withholding on sales usually, or different logic
                $data['tax_inclusive'] ?? false
            );

            // 2. Create Header
            $invoice = CustomerInvoice::create([
                'customer_id' => $data['customer_id'],
                'invoice_number' => $data['invoice_number'],
                'reference_number' => $data['reference_number'] ?? null,
                'date' => $data['date'],
                'due_date' => $data['due_date'] ?? null,
                'status' => 'draft',
                'subtotal' => $taxCalc['subtotal'],
                'tax_amount' => $taxCalc['tax_amount'],
                'total_amount' => $taxCalc['total'],
                'notes' => $data['notes'] ?? null,
            ]);

            // 3. Create Lines
            foreach ($data['items'] as $itemData) {
                $lineTotal = $itemData['quantity'] * $itemData['unit_price'];
                CustomerInvoiceLine::create([
                    'customer_invoice_id' => $invoice->id,
                    'product_id' => $itemData['product_id'] ?? null,
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total' => $lineTotal,
                ]);
            }

            return $invoice;
        });
    }

    public function post(CustomerInvoice $invoice): void
    {
        if ($invoice->status !== 'draft') {
            throw new InvalidArgumentException('Only draft invoices can be posted.');
        }

        DB::transaction(function () use ($invoice) {
            $invoice->update(['status' => 'posted']);

            // Create Journal Entry
            // Debit: Accounts Receivable (1200)
            // Credit: Sales Revenue (4000)
            // Credit: Tax Payable (2200)

            $arAccount = ChartOfAccount::where('code', '1200')->first();
            $revenueAccount = ChartOfAccount::where('code', '4000')->first();
            $taxAccount = ChartOfAccount::where('code', '2200')->first();

            if (! $arAccount || ! $revenueAccount) {
                // Fallback or error. For now, let's assume they exist or throw
                throw new InvalidArgumentException('Required Chart of Accounts (1200, 4000) not found.');
            }

            $lines = [
                // Debit AR (Total Receivable)
                [
                    'chart_of_account_id' => $arAccount->id,
                    'debit' => $invoice->total_amount,
                    'credit' => 0,
                ],
                // Credit Revenue (Subtotal)
                [
                    'chart_of_account_id' => $revenueAccount->id,
                    'debit' => 0,
                    'credit' => $invoice->subtotal,
                ],
            ];

            // Credit Tax (if any)
            if ($invoice->tax_amount > 0 && $taxAccount) {
                $lines[] = [
                    'chart_of_account_id' => $taxAccount->id,
                    'debit' => 0,
                    'credit' => $invoice->tax_amount,
                ];
            }

            $this->createJournalEntryService->execute(
                \Illuminate\Support\Carbon::parse($invoice->date)->format('Y-m-d'),
                $invoice->invoice_number,
                "Sales Invoice #{$invoice->invoice_number} - {$invoice->customer_id}", // TODO: Customer Name
                $lines
            );
        });
    }
}
