<?php

namespace App\Jobs;

use App\Models\BlanketOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckBlanketOrderExpiryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Checking for expired blanket orders...');

        // Expire BPOs where end_date is past and status is in a running state
        $expiredCount = BlanketOrder::whereIn('status', [
                BlanketOrder::STATUS_OPEN, 
                BlanketOrder::STATUS_PARTIALLY_ORDERED,
            ])
            ->where('end_date', '<', now()->startOfDay())
            ->update(['status' => BlanketOrder::STATUS_EXPIRED]);

        if ($expiredCount > 0) {
            Log::info("Expired {$expiredCount} blanket orders.");
        }
    }
}
