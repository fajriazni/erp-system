<?php

namespace App\Domain\Sales\Services;

use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Models\ChartOfAccount;
use App\Models\CustomerInvoice;
use App\Models\CustomerPayment;
use App\Models\CustomerPaymentLine;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ReceiveCustomerPaymentService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService
    ) {}

    public function execute(array $data): CustomerPayment
    {
        return DB::transaction(function () use ($data) {
            // 1. Validate Total Matches Allocations
            $totalAllocated = 0;
            if (isset($data['allocations']) && is_array($data['allocations'])) {
                foreach ($data['allocations'] as $allocation) {
                    $totalAllocated += $allocation['amount'];
                }
            }

            if (abs($data['amount'] - $totalAllocated) > 1.0) {
                // Allow small diff
                throw new InvalidArgumentException('Payment amount must match allocations.');
            }

            // 2. Create Header
            $payment = CustomerPayment::create([
                'payment_number' => $data['payment_number'],
                'customer_id' => $data['customer_id'],
                'date' => $data['date'],
                'amount' => $data['amount'],
                'reference' => $data['reference'] ?? null,
                'payment_method' => $data['payment_method'] ?? 'bank_transfer',
                'notes' => $data['notes'] ?? null,
            ]);

            // 3. Process Allocations
            foreach ($data['allocations'] as $allocation) {
                CustomerPaymentLine::create([
                    'customer_payment_id' => $payment->id,
                    'customer_invoice_id' => $allocation['invoice_id'],
                    'amount' => $allocation['amount'],
                ]);

                // Update Invoice Status
                $invoice = CustomerInvoice::findOrFail($allocation['invoice_id']);
                // Mocking paid amount calculation or using relationship
                // We need to fetch all payments for this invoice
                // For now, let's assume we can query check logic or just update status if fully paid
                // This logic should be robust.
            }

            // 4. Create Journal Entry
            // Debit: Cash/Bank (1100)
            // Credit: Accounts Receivable (1200)

            $arAccount = ChartOfAccount::where('code', '1200')->firstOrFail();
            $cashAccount = ChartOfAccount::where('code', '1100')->firstOrFail(); // Default Cash

            // Ideally UI selects Deposit Account

            $lines = [
                [
                    'chart_of_account_id' => $cashAccount->id,
                    'debit' => $data['amount'],
                    'credit' => 0,
                ],
                [
                    'chart_of_account_id' => $arAccount->id,
                    'debit' => 0,
                    'credit' => $data['amount'],
                ],
            ];

            $this->createJournalEntryService->execute(
                \Carbon\Carbon::parse($payment->date)->format('Y-m-d'),
                $payment->payment_number,
                "Payment Received #{$payment->payment_number}",
                $lines
            );

            return $payment;
        });
    }
}
