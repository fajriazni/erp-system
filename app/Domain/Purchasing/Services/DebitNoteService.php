<?php

namespace App\Domain\Purchasing\Services;

use App\Models\DebitNote;
use App\Models\PurchaseReturn;
use App\Models\VendorBill;
use Illuminate\Support\Facades\DB;

class DebitNoteService
{
    /**
     * Create debit note from purchase return
     */
    public function createFromReturn(PurchaseReturn $return): DebitNote
    {
        if ($return->debitNote) {
            throw new \Exception('Debit note already exists for this return');
        }

        return DB::transaction(function () use ($return) {
            $debitNote = DebitNote::create([
                'debit_note_number' => $this->generateDebitNoteNumber(),
                'purchase_return_id' => $return->id,
                'vendor_id' => $return->vendor_id,
                'date' => now(),
                'due_date' => now()->addDays(30),
                'total_amount' => $return->total_amount,
                'applied_amount' => 0,
                'remaining_amount' => $return->total_amount,
                'reference_number' => $return->return_number,
                'notes' => "Debit Note from Purchase Return #{$return->return_number}",
                'status' => 'unposted',
            ]);

            return $debitNote;
        });
    }

    /**
     * Post debit note to accounting
     */
    public function post(DebitNote $debitNote): void
    {
        if ($debitNote->status !== 'unposted') {
            throw new \Exception('Debit note already posted');
        }

        DB::transaction(function () use ($debitNote) {
            $debitNote->post();
        });
    }

    /**
     * Apply debit note to vendor bill
     */
    public function applyToInvoice(DebitNote $debitNote, VendorBill $bill, float $amount): void
    {
        if ($debitNote->status === 'voided') {
            throw new \Exception('Cannot apply voided debit note');
        }

        if ($debitNote->vendor_id !== $bill->vendor_id) {
            throw new \Exception('Debit note and bill must be for same vendor');
        }

        if ($amount > $debitNote->remaining_amount) {
            throw new \Exception('Amount exceeds debit note remaining balance');
        }

        DB::transaction(function () use ($debitNote, $bill, $amount) {
            $debitNote->applyToInvoice($bill, $amount);
        });
    }

    /**
     * Void debit note
     */
    public function void(DebitNote $debitNote, string $reason): void
    {
        if ($debitNote->applied_amount > 0) {
            throw new \Exception('Cannot void debit note that has been applied');
        }

        DB::transaction(function () use ($debitNote, $reason) {
            $debitNote->void($reason);
        });
    }

    /**
     * Auto-apply debit notes to open bills for vendor
     */
    public function autoApply(DebitNote $debitNote): void
    {
        if ($debitNote->status !== 'posted') {
            return;
        }

        $openBills = VendorBill::where('vendor_id', $debitNote->vendor_id)
            ->where('status', 'posted')
            ->where('total_amount', '>', 0)
            ->orderBy('date', 'asc')
            ->get();

        $remainingAmount = $debitNote->remaining_amount;

        foreach ($openBills as $bill) {
            if ($remainingAmount <= 0) {
                break;
            }

            $amountToApply = min($remainingAmount, $bill->total_amount);

            $this->applyToInvoice($debitNote, $bill, $amountToApply);

            $remainingAmount -= $amountToApply;
        }
    }

    protected function generateDebitNoteNumber(): string
    {
        $year = now()->format('y');
        $month = now()->format('m');

        $lastNote = DebitNote::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->latest('id')
            ->first();

        $sequence = $lastNote ? ((int) substr($lastNote->debit_note_number, -4)) + 1 : 1;

        return sprintf('DN-%s%s-%04d', $year, $month, $sequence);
    }
}
