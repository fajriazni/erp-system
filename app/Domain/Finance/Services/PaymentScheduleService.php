<?php

namespace App\Domain\Finance\Services;

use App\Models\PurchaseOrder;
use Carbon\Carbon;

class PaymentScheduleService
{
    /**
     * Calculate expected billing schedule for a Purchase Order.
     * returns array of [
     *   'description' => string,
     *   'percent' => float,
     *   'amount' => float,
     *   'due_date' => Carbon|null,
     *   'trigger' => string (approval, receipt, invoice)
     * ]
     */
    public function calculateSchedule(PurchaseOrder $purchaseOrder): array
    {
        if (! $purchaseOrder->payment_term_id || ! $purchaseOrder->paymentTerm) {
            // Default to single immediate/manual payment if no term
            return [];
        }

        $term = $purchaseOrder->paymentTerm;
        $total = $purchaseOrder->total;
        $schedule = [];

        if ($term->type === 'standard') {
            // Standard: Full payment due X days after invoice (usually)
            // But here we are projecting.
            // Let's assume Trigger is Invoice Date.
            $schedule[] = [
                'description' => 'Full Payment (Net '.$term->days_due.')',
                'percent' => 100,
                'amount' => $total,
                'due_date' => null, // Depends on Invoice Date
                'trigger' => 'invoice',
                'days_due' => $term->days_due,
            ];
        } elseif ($term->type === 'schedule' && is_array($term->schedule_definition)) {
            foreach ($term->schedule_definition as $item) {
                $amount = $total * ($item['percent'] / 100);

                // Calculate estimated due date if possible
                $dueDate = null;
                if ($item['trigger'] === 'approval' && $purchaseOrder->isApproved()) {
                    // If approved, we know the base date is updated_at (approval time)
                    // roughly.
                    $baseDate = $purchaseOrder->updated_at; // Approximation
                    $dueDate = $baseDate ? $baseDate->copy()->addDays($item['days']) : null;
                }

                $schedule[] = [
                    'description' => $item['description'] ?? 'Payment',
                    'percent' => $item['percent'],
                    'amount' => $amount,
                    'due_date' => $dueDate,
                    'trigger' => $item['trigger'],
                    'days_due' => $item['days'],
                ];
            }
        }

        return $schedule;
    }

    /**
     * Calculate steps with billing status (pending, partial, billed)
     */
    /**
     * Calculate steps with billing status (pending, partial, billed)
     */
    public function calculateRemainingSchedule(PurchaseOrder $purchaseOrder, ?int $excludeBillId = null): array
    {
        $schedule = $this->calculateSchedule($purchaseOrder);

        // Calculate total amount already billed (excluding cancelled bills and the current bill if editing)
        $billedTotalQuery = $purchaseOrder->vendorBills()
            ->where('status', '!=', 'cancelled');

        if ($excludeBillId) {
            $billedTotalQuery->where('id', '!=', $excludeBillId);
        }

        $billedTotal = $billedTotalQuery->sum('total_amount');

        $coveredAmount = $billedTotal;

        foreach ($schedule as &$item) {
            $amount = $item['amount'];

            if ($coveredAmount >= $amount - 0.01) { // Float tolerance
                // Fully billed
                $item['status'] = 'billed';
                $item['remaining_amount'] = 0;
                $coveredAmount -= $amount;
            } elseif ($coveredAmount > 0) {
                // Partially billed
                $item['status'] = 'partial';
                $item['remaining_amount'] = $amount - $coveredAmount;
                $item['billed_amount'] = $coveredAmount;
                $coveredAmount = 0;
            } else {
                // Not billed
                $item['status'] = 'pending';
                $item['remaining_amount'] = $amount;
            }
        }

        return $schedule;
    }
}
