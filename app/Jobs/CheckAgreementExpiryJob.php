<?php

namespace App\Jobs;

use App\Models\PurchaseAgreement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckAgreementExpiryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Checking for expired purchase agreements...');

        // Expire agreements where end_date is past
        $expiredCount = PurchaseAgreement::where('status', PurchaseAgreement::STATUS_ACTIVE)
            ->where('end_date', '<', now()->startOfDay())
            ->update(['status' => PurchaseAgreement::STATUS_EXPIRED]);

        if ($expiredCount > 0) {
            Log::info("Expired {$expiredCount} purchase agreements.");
        }
        
        // Auto-close agreements that are fulfilled? 
        // Logic for fulfilled would need to check BPO/PO usage vs total_value_cap
        // For now, only handling expiry by date.
    }
}
