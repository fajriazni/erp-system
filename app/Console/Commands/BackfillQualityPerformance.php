<?php

namespace App\Console\Commands;

use App\Domain\Purchasing\Services\VendorScorecardService;
use App\Models\GoodsReceiptItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillQualityPerformance extends Command
{
    protected $signature = 'vendor:backfill-quality';

    protected $description = 'Backfill vendor quality performance from existing QC inspections';

    public function handle(VendorScorecardService $scorecardService): int
    {
        $this->info('Backfilling quality performance from QC inspections...');

        // Get all items that have been fully inspected
        $items = GoodsReceiptItem::whereNotNull('qc_status')
            ->where('qc_status', '!=', 'pending')
            ->where(DB::raw('qc_passed_qty + qc_failed_qty'), '>=', DB::raw('quantity_received'))
            ->with(['goodsReceipt.purchaseOrder.vendor'])
            ->get();

        if ($items->isEmpty()) {
            $this->warn('No completed QC inspections found.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($items->count());
        $bar->start();

        $processed = 0;
        foreach ($items as $item) {
            $receipt = $item->goodsReceipt;

            if ($receipt && $receipt->purchaseOrder && $receipt->purchaseOrder->vendor) {
                // Record quality performance
                $scorecardService->recordQualityPerformance(
                    $receipt,
                    (int) $item->qc_passed_qty,
                    (int) $item->qc_failed_qty
                );
                $processed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Processed {$processed} QC inspections!");
        $this->info('Now recalculating vendor metrics...');

        // Recalculate all vendor scores
        $this->call('vendor:recalculate-scorecard');

        return self::SUCCESS;
    }
}
