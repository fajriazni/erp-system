<?php

namespace App\Console\Commands;

use App\Domain\Purchasing\Services\VendorScorecardService;
use App\Models\Contact;
use Illuminate\Console\Command;

class RecalculateVendorScorecard extends Command
{
    protected $signature = 'vendor:recalculate-scorecard {--vendor= : Specific vendor ID to recalculate}';

    protected $description = 'Recalculate vendor performance scorecards based on transaction history';

    public function handle(VendorScorecardService $scorecardService): int
    {
        $vendorId = $this->option('vendor');

        if ($vendorId) {
            $vendor = Contact::find($vendorId);

            if (! $vendor) {
                $this->error("Vendor with ID {$vendorId} not found.");

                return self::FAILURE;
            }

            $this->info("Recalculating scorecard for vendor: {$vendor->name}");
            $scorecardService->updateVendorMetrics($vendor);
            $vendor->refresh();

            $this->displayVendorScore($vendor);
            $this->info('✓ Scorecard updated successfully!');

            return self::SUCCESS;
        }

        // Recalculate for all vendors
        $vendors = Contact::whereIn('type', ['vendor', 'both'])->get();

        if ($vendors->isEmpty()) {
            $this->warn('No vendors found.');

            return self::SUCCESS;
        }

        $this->info("Recalculating scorecards for {$vendors->count()} vendors...");

        $bar = $this->output->createProgressBar($vendors->count());
        $bar->start();

        $updated = 0;
        foreach ($vendors as $vendor) {
            $scorecardService->updateVendorMetrics($vendor);
            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Updated scorecards for {$updated} vendors!");

        return self::SUCCESS;
    }

    protected function displayVendorScore(Contact $vendor): void
    {
        $this->newLine();
        $this->line('┌─────────────────────────────────────────┐');
        $this->line('│  Vendor Performance Scorecard           │');
        $this->line('├─────────────────────────────────────────┤');

        $rating = $vendor->rating_score ?? 0;
        $stars = str_repeat('★', (int) round($rating)).str_repeat('☆', 5 - (int) round($rating));
        $this->line(sprintf('│  Overall Rating: %s (%.2f/5)  │', $stars, $rating));
        $this->line('├─────────────────────────────────────────┤');
        $this->line(sprintf('│  On-Time Delivery: %s%%', $vendor->on_time_rate ? number_format($vendor->on_time_rate, 1) : 'N/A'));
        $this->line(sprintf('│  Quality Rate:     %s%%', $vendor->quality_rate ? number_format($vendor->quality_rate, 1) : 'N/A'));
        $this->line(sprintf('│  Return Rate:      %s%%', $vendor->return_rate ? number_format($vendor->return_rate, 1) : 'N/A'));
        $this->line('└─────────────────────────────────────────┘');
        $this->newLine();
    }
}
