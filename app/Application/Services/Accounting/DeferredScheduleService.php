<?php

namespace App\Application\Services\Accounting;

use App\Models\DeferredSchedule;
use App\Models\DeferredScheduleItem;
use App\Models\JournalEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class DeferredScheduleService
{
    /**
     * Create a new deferred schedule and calculate monthly items
     */
    public function createSchedule(array $data): DeferredSchedule
    {
        return DB::transaction(function () use ($data) {
            $schedule = DeferredSchedule::create([
                'code' => $data['code'],
                'name' => $data['name'],
                'type' => $data['type'],
                'total_amount' => $data['total_amount'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'deferred_account_id' => $data['deferred_account_id'],
                'recognition_account_id' => $data['recognition_account_id'],
                'description' => $data['description'] ?? null,
                'status' => 'active', // Should start as active if confirmed? Or draft? Let's say draft usually, but for MVP active.
            ]);

            $this->generateScheduleItems($schedule);

            return $schedule;
        });
    }

    /**
     * Calculate and generate schedule items (Straight Line)
     */
    protected function generateScheduleItems(DeferredSchedule $schedule): void
    {
        $startDate = Carbon::parse($schedule->start_date)->startOfMonth(); // Align to month start for simplicity? Or exact dates? 
        // Usually deferred revenue is recognized monthly. Let's assume standard monthly recognition.
        // User inputs "Jan 1 to Dec 31".
        
        $endDate = Carbon::parse($schedule->end_date)->endOfMonth();
        
        // Calculate number of months
        $months = $startDate->diffInMonths($endDate) + 1;
        if ($months <= 0) $months = 1;

        $amountPerMonth = floor(($schedule->total_amount / $months) * 100) / 100;
        $remainder = $schedule->total_amount - ($amountPerMonth * $months);

        for ($i = 0; $i < $months; $i++) {
            $date = $startDate->copy()->addMonths($i)->lastOfMonth(); // Recognize at end of month
            
            // Adjust last month for remainder
            $amount = $amountPerMonth;
            if ($i === $months - 1) {
                $amount += $remainder;
            }

            $schedule->items()->create([
                'date' => $date,
                'amount' => $amount,
                'is_processed' => false,
            ]);
        }
    }

    /**
     * Process a schedule item: Create Journal Entry
     */
    public function processItem(DeferredScheduleItem $item, User $user): JournalEntry
    {
        if ($item->is_processed) {
            throw new InvalidArgumentException("Item already processed.");
        }

        return DB::transaction(function () use ($item, $user) {
            $schedule = $item->schedule;
            
            // Determine Debit/Credit based on type
            // Expense (Prepaid): We consume asset -> Debit Expense, Credit Asset
            // Revenue (Unearned): We earn revenue -> Debit Liability, Credit Revenue
            
            $debitAccount = null;
            $creditAccount = null;

            if ($schedule->type === 'expense') {
                $debitAccount = $schedule->recognition_account_id; // Expense
                $creditAccount = $schedule->deferred_account_id;   // Prepaid Asset
            } else {
                $debitAccount = $schedule->deferred_account_id;    // Unearned Liability
                $creditAccount = $schedule->recognition_account_id;// Revenue
            }

            // Create Journal Entry
            $je = JournalEntry::create([
                'reference_number' => 'DEF-' . $schedule->code . '-' . $item->date->format('ym'),
                'date' => $item->date,
                'description' => "Amortization: {$schedule->name} ({$item->date->format('M Y')})",
                'status' => 'draft', // Create as draft first, let user review? Or post immediately?
                // Plan said "Automated... permissions to post". 
                // Let's post automatically for convenience
                'currency_code' => 'IDR', // Default
                'exchange_rate' => 1,
            ]);

            // Lines
            $je->lines()->create([
                'chart_of_account_id' => $debitAccount,
                'debit' => $item->amount,
                'credit' => 0,
                'description' => "Amortization Debit",
            ]);
            
            $je->lines()->create([
                'chart_of_account_id' => $creditAccount,
                'debit' => 0,
                'credit' => $item->amount,
                'description' => "Amortization Credit",
            ]);

            // Post the entry
            $je->post($user);

            // Update item
            $item->update([
                'is_processed' => true,
                'journal_entry_id' => $je->id,
            ]);

            // Check if schedule is complete
            if ($schedule->items()->where('is_processed', false)->count() === 0) {
                $schedule->update(['status' => 'completed']);
            }

            return $je;
        });
    }
}
