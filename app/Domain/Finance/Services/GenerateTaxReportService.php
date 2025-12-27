<?php

namespace App\Domain\Finance\Services;

use App\Models\CustomerInvoice;
use App\Models\TaxPeriod;
use App\Models\VendorBill;
use Carbon\Carbon;

class GenerateTaxReportService
{
    /**
     * Generate or regenerate tax report for a specific period
     *
     * @param  string  $period  Format: "YYYY-MM" (e.g., "2025-01")
     */
    public function execute(string $period): TaxPeriod
    {
        // Parse period
        $date = Carbon::createFromFormat('Y-m', $period);
        $startDate = $date->copy()->startOfMonth();
        $endDate = $date->copy()->endOfMonth();

        // Get or create tax period
        $taxPeriod = TaxPeriod::firstOrCreate(
            ['period' => $period],
            [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'draft',
            ]
        );

        // Calculate PPN Input (from Vendor Bills)
        $inputTax = VendorBill::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'posted')
            ->sum('tax_amount');

        // Calculate PPN Output (from Customer Invoices)
        $outputTax = CustomerInvoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'posted')
            ->sum('tax_amount');

        // Calculate Net Tax
        // Positive = Payable (more output than input)
        // Negative = Claimable (more input than output)
        // Update tax period
        $taxPeriod->update([
            'input_tax' => $inputTax,
            'output_tax' => $outputTax,
            // Input - Output formula: negative = payable, positive = claimable
            'net_tax' => $inputTax - $outputTax,
        ]);

        return $taxPeriod->fresh();
    }

    /**
     * Get detailed transactions for a tax period
     */
    public function getDetailedTransactions(TaxPeriod $taxPeriod): array
    {
        $vendorBills = VendorBill::with('vendor')
            ->whereBetween('date', [$taxPeriod->start_date, $taxPeriod->end_date])
            ->where('status', 'posted')
            ->where('tax_amount', '>', 0)
            ->orderBy('date')
            ->get()
            ->map(fn ($bill) => [
                'type' => 'input',
                'date' => $bill->date,
                'reference' => $bill->bill_number,
                'partner' => $bill->vendor->name,
                'base_amount' => $bill->subtotal,
                'tax_rate' => $bill->tax_rate,
                'tax_amount' => $bill->tax_amount,
            ]);

        $customerInvoices = CustomerInvoice::with('customer')
            ->whereBetween('date', [$taxPeriod->start_date, $taxPeriod->end_date])
            ->where('status', 'posted')
            ->where('tax_amount', '>', 0)
            ->orderBy('date')
            ->get()
            ->map(fn ($invoice) => [
                'type' => 'output',
                'date' => $invoice->date,
                'reference' => $invoice->invoice_number,
                'partner' => $invoice->customer->name,
                'base_amount' => $invoice->subtotal,
                'tax_rate' => 11, // Default PPN rate, adjust if needed
                'tax_amount' => $invoice->tax_amount,
            ]);

        return [
            'input_transactions' => $vendorBills->toArray(),
            'output_transactions' => $customerInvoices->toArray(),
            'summary' => [
                'total_input_tax' => $vendorBills->sum('tax_amount'),
                'total_output_tax' => $customerInvoices->sum('tax_amount'),
                'net_tax' => $taxPeriod->net_tax,
                'is_payable' => $taxPeriod->is_payable,
                'is_claimable' => $taxPeriod->is_claimable,
            ],
        ];
    }
}
