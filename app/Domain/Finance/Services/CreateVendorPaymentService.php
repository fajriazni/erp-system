<?php

namespace App\Domain\Finance\Services;

use App\Models\ChartOfAccount;
use App\Models\VendorBill;
use App\Models\VendorPayment;
use App\Models\VendorPaymentLine;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreateVendorPaymentService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService
    ) {}

    /**
     * Create a new Vendor Payment.
     *
     * @throws Exception
     */
    public function execute(array $data): VendorPayment
    {
        return DB::transaction(function () use ($data) {
            // 1. Validate Total Amount matches Allocations
            $totalAllocated = 0;
            if (isset($data['allocations']) && is_array($data['allocations'])) {
                foreach ($data['allocations'] as $allocation) {
                    $totalAllocated += $allocation['amount'];
                }
            }

            // Floating point comparison
            if (abs($data['amount'] - $totalAllocated) > 0.01) {
                // For now, strict: Total payment must match allocations
                // Later we can allow unallocated amounts (e.g. credit on account)
                throw new InvalidArgumentException('Payment amount must match the sum of bill allocations.');
            }

            // 2. Create Header
            $payment = VendorPayment::create([
                'payment_number' => $data['payment_number'],
                'vendor_id' => $data['vendor_id'],
                'date' => $data['date'],
                'amount' => $data['amount'],
                'reference' => $data['reference'] ?? null,
                'payment_method' => $data['payment_method'] ?? 'bank_transfer',
                'notes' => $data['notes'] ?? null,
                'status' => 'posted', // Payments are immediate for now
            ]);

            // 3. Process Allocations
            foreach ($data['allocations'] as $allocation) {
                VendorPaymentLine::create([
                    'vendor_payment_id' => $payment->id,
                    'vendor_bill_id' => $allocation['bill_id'],
                    'amount' => $allocation['amount'],
                ]);

                // Update Bill Status
                $bill = VendorBill::findOrFail($allocation['bill_id']);
                // Use the fresh relationship to re-sum inclusive of this new payment
                $amountPaid = $bill->paymentLines()->sum('amount');

                if ($amountPaid >= $bill->total_amount - 0.01) {
                    $bill->update(['status' => 'paid']);
                } else {
                    $bill->update(['status' => 'partial']);
                }
            }

            // 4. Create Journal Entry
            // Debit: Accounts Payable (2100)
            // Credit: Cash (1100) or Bank - For now defaulting to Cash 1100 or making it configurable
            // Ideally UI passes `credit_account_id`.

            $debitAccount = ChartOfAccount::where('code', '2100')->firstOrFail();
            $creditAccountId = $data['payment_account_id'] ?? null;

            if (! $creditAccountId) {
                // Fallback to Cash 1100
                $creditAccount = ChartOfAccount::where('code', '1100')->firstOrFail();
                $creditAccountId = $creditAccount->id;
            }

            $lines = [
                [
                    'chart_of_account_id' => $debitAccount->id,
                    'debit' => $data['amount'],
                    'credit' => 0,
                ],
                [
                    'chart_of_account_id' => $creditAccountId,
                    'debit' => 0,
                    'credit' => $data['amount'],
                ],
            ];

            $this->createJournalEntryService->execute(
                \Carbon\Carbon::parse($payment->date)->format('Y-m-d'), // date is cast to Carbon by model, but $data['date'] might be string. Model not instantiated fully yet?
                // Actually $payment->date will be Carbon instance if cast is correct
                // BUT $data['date'] is safer string
                // Let's rely on $payment->date but ensure format
                $payment->payment_number,
                "Payment {$payment->payment_number} to {$payment->vendor->name}",
                $lines
            );

            return $payment;
        });
    }
}
