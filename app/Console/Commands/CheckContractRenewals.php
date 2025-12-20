<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckContractRenewals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'purchasing:check-renewals';
    protected $description = 'Check for expiring contracts and blanket orders and send renewal alerts';

    public function handle()
    {
        $this->checkAgreements();
        $this->checkBlanketOrders();
    }

    protected function checkAgreements()
    {
        // Find active agreements where end_date is (today + renewal_reminder_days)
        $agreements = \App\Models\PurchaseAgreement::where('status', 'active')
            ->whereNotNull('end_date')
            ->get();

        foreach ($agreements as $agreement) {
            $daysRemaining = \Carbon\Carbon::now()->diffInDays($agreement->end_date, false);
            // Check if exactly matching the reminder threshold, OR if it's less than threshold and divisible by 7 (weekly reminder) ??
            // OR just check if it matches the reminder days. Let's do matches reminder days for now to avoid spam, maybe also 7 days before.
            
            if ($daysRemaining == $agreement->renewal_reminder_days || $daysRemaining == 7 || $daysRemaining == 1) {
                 $this->info("Sending alert for Agreement {$agreement->reference_number} ({$daysRemaining} days left)");
                 $this->notifyUsers($agreement, (int)$daysRemaining);
            }
        }
    }

    protected function checkBlanketOrders()
    {
        $bpos = \App\Models\BlanketOrder::where('status', 'active')
            ->whereNotNull('end_date')
            ->get();

        foreach ($bpos as $bpo) {
             $daysRemaining = \Carbon\Carbon::now()->diffInDays($bpo->end_date, false);
             
             if ($daysRemaining == $bpo->renewal_reminder_days || $daysRemaining == 7 || $daysRemaining == 1) {
                 $this->info("Sending alert for BPO {$bpo->number} ({$daysRemaining} days left)");
                 $this->notifyUsers($bpo, (int)$daysRemaining);
             }
        }
    }

    protected function notifyUsers($contract, int $daysRemaining)
    {
        // Find users to notify. Assuming all users for now as requested, or filter by role/permission if available.
        // Let's trying to find users with 'manage purchasing' permission if possible, else all.
        // Since I can't confirm permissions easily without checking DB contents or seeders, I'll send to all users which is safe for dev.
        // BETTER: Send to the first user found :) No, send to all Users.
        
        $users = \App\Models\User::all(); // TODO: Filter by permission 'manage purchasing'
        
        // Use Notification Facade to send to collection
        \Illuminate\Support\Facades\Notification::send($users, new \App\Notifications\Purchasing\ContractRenewalNotification($contract, $daysRemaining));
    }
}
