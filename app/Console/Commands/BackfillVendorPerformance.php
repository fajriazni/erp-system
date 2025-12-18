<?php

namespace App\Console\Commands;

use App\Domain\Purchasing\Services\VendorScorecardService;
use App\Models\GoodsReceipt;
use Illuminate\Console\Command;

class BackfillVendorPerformance extends Command
{
    protected $signature = 'vendor:backfill-performance';

    protected $description = 'Backfill vendor performance logs from existing goods receipts';

    public function handle(VendorScorecardService $scorecardService): int
    {
        $this->info('Backfilling vendor performance from posted goods receipts...');

        $receipts = GoodsReceipt::where('status', 'posted')
            ->with('purchaseOrder')
            ->get();

        if ($receipts->isEmpty()) {
            $this->warn('No posted goods receipts found.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($receipts->count());
        $bar->start();

        $processed = 0;
        foreach ($receipts as $receipt) {
            $po = $receipt->purchaseOrder;

            if ($po && $po->vendor) {
                // Record delivery performance
                $scorecardService->recordDeliveryPerformance($po, $receipt);
                $processed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Processed {$processed} goods receipts!");
        $this->info('Now recalculating vendor metrics...');

        // Rec calculate all vendor scores
        $this->call('vendor:recalculate-scorecard');

        return self::SUCCESS;
    }
}
