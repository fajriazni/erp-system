<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Models\ChartOfAccount;
use App\Models\VendorBill;
use Exception;
use Illuminate\Support\Facades\DB;

class PostVendorBillService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService,
        protected ThreeWayMatchService $matchService
    ) {}

    public function execute(VendorBill $bill): void
    {
        if ($bill->status !== 'draft') {
            throw new Exception('Only draft bills can be posted.');
        }

        DB::transaction(function () use ($bill) {
            // Run 3-Way Match
            $matchResult = $this->matchService->match($bill);
            $this->matchService->applyResult($bill, $matchResult);

            $bill->update(['status' => 'posted']);

            // Resolve Accounts
            // TODO: In the future, these should be configurable settings
            $apAccount = ChartOfAccount::where('code', '2100')->firstOrFail(); // Accounts Payable
            $clearingAccount = ChartOfAccount::where('code', '2110')->firstOrFail(); // Unbilled Payables (GR/IR)
            $inputTaxAccount = ChartOfAccount::where('code', '1500')->first(); // Input Tax / VAT Receivable

            // Prepare Journal Entry Lines
            $lines = [];

            // 1. Credit AP (Total Amount)
            $lines[] = [
                'chart_of_account_id' => $apAccount->id,
                'debit' => 0,
                'credit' => $bill->total_amount,
            ];

            // 2. Debit Clearing (Subtotal - representing goods value)
            // Note: If tax inclusive, subtotal should be net. Our model has subtotal.
            $lines[] = [
                'chart_of_account_id' => $clearingAccount->id,
                'debit' => $bill->subtotal,
                'credit' => 0,
            ];

            // 3. Debit Input Tax (Tax Amount)
            if ($bill->tax_amount > 0 && $inputTaxAccount) {
                $lines[] = [
                    'chart_of_account_id' => $inputTaxAccount->id,
                    'debit' => $bill->tax_amount,
                    'credit' => 0,
                ];
            } elseif ($bill->tax_amount > 0 && ! $inputTaxAccount) {
                // If tax account missing, dump into clearing for now or throw error
                // Ideally throw error to force setup
                throw new Exception('Input Tax Account (1500) is missing in Chart of Accounts.');
            }

            // Create Journal Entry
            $this->createJournalEntryService->execute(
                \Carbon\Carbon::parse($bill->date)->format('Y-m-d'),
                $bill->bill_number,
                "Vendor Bill #{$bill->bill_number} - {$bill->vendor->name}", // Vendor name might be company_name? using name as per previous fix
                $lines
            );
        });
    }
}
