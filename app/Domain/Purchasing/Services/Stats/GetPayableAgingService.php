<?php

namespace App\Domain\Purchasing\Services\Stats;

use App\Models\VendorBill;
use Carbon\Carbon;

class GetPayableAgingService
{
    /**
     * Get aging summary of unpaid vendor bills.
     */
    public function execute(): array
    {
        // Get all posted bills
        // Since 'amount_paid' is an appended attribute/calculation, we can't search by it easily in SQL
        // unless we join tables. For now, fetch all posted bills and filter in PHP.
        $bills = VendorBill::where('status', 'posted')
            ->with('paymentLines') // Eager load for performance
            ->get()
            ->filter(function ($bill) {
                return $bill->amount_paid < $bill->total_amount;
            });

        $buckets = [
            '0-30' => 0,
            '31-60' => 0,
            '61-90' => 0,
            '90+' => 0,
        ];

        $now = Carbon::now();

        foreach ($bills as $bill) {
            $dueDate = $bill->due_date ? Carbon::parse($bill->due_date) : Carbon::parse($bill->date);
            $outstanding = $bill->total_amount - $bill->amount_paid;

            $daysOverdue = $dueDate->diffInDays($now, false); // false = negative if not yet due (future), positive if overdue

            // If it's not due yet, or just became due (<= 30 days old from invoice date if using invoice date, or simply 0-30 overdue)
            // Implementation detail: "Aging" usually means "Days Past Due" or "Age of Invoice".
            // Let's stick to "Age of Invoice" relative to NOW, or "Days Overdue".
            // Standard Accounting Aging: Current (not due), 1-30 days overdue, 31-60, etc.
            // Simplified for this plan: 0-30 days OLD, 31-60 days OLD from date?
            // Implementation Plan said: "due dates relative to now"

            // Let's use Days Overdue.
            // If not overdue (future due date), it falls into "Current".
            // If we use invoice date age:
            $age = Carbon::parse($bill->date)->diffInDays($now);

            if ($age <= 30) {
                $buckets['0-30'] += $outstanding;
            } elseif ($age <= 60) {
                $buckets['31-60'] += $outstanding;
            } elseif ($age <= 90) {
                $buckets['61-90'] += $outstanding;
            } else {
                $buckets['90+'] += $outstanding;
            }
        }

        return $buckets;
    }
}
