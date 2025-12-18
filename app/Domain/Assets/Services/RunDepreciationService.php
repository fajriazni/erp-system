<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\DepreciationEntry;
use App\Domain\Finance\Services\CreateJournalEntryService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RunDepreciationService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService
    ) {}

    public function execute(string $date): Collection
    {
        $depreciationDate = Carbon::parse($date);
        $assets = Asset::where('status', 'active')
            ->where('start_depreciation_date', '<=', $depreciationDate)
            ->get();

        $processedAssets = collect();

        DB::transaction(function () use ($assets, $depreciationDate, $processedAssets) {
            foreach ($assets as $asset) {
                if ($this->shouldDepreciate($asset, $depreciationDate)) {
                    $this->depreciateAsset($asset, $depreciationDate);
                    $processedAssets->push($asset);
                }
            }
        });

        return $processedAssets;
    }

    protected function shouldDepreciate(Asset $asset, Carbon $date): bool
    {
        // Simple check: has it already been depreciated this month?
        $existingEntry = $asset->depreciationEntries()
            ->whereYear('date', $date->year)
            ->whereMonth('date', $date->month)
            ->exists();

        if ($existingEntry) {
            return false;
        }

        // Is it fully depreciated?
        if ($asset->book_value <= $asset->salvage_value) {
            $asset->update(['status' => 'fully_depreciated']);

            return false;
        }

        return true;
    }

    protected function depreciateAsset(Asset $asset, Carbon $date): void
    {
        $amount = $this->calculateDepreciationAmount($asset);

        // Don't depreciate below salvage value
        if ($asset->book_value - $amount < $asset->salvage_value) {
            $amount = $asset->book_value - $asset->salvage_value;
        }

        if ($amount <= 0) {
            return;
        }

        // 1. Create Journal Entry
        $category = $asset->category;

        $description = "Depreciation for {$asset->name} ({$asset->asset_number}) - {$date->format('M Y')}";

        $journalEntry = $this->createJournalEntryService->execute(
            date: $date->format('Y-m-d'),
            referenceNumber: 'DEPR-'.$asset->asset_number.'-'.$date->format('Ym'),
            description: $description,
            lines: [
                [
                    'chart_of_account_id' => $category->depreciation_expense_account_id,
                    'debit' => $amount,
                    'credit' => 0,
                    'description' => $description,
                ],
                [
                    'chart_of_account_id' => $category->accumulated_depreciation_account_id,
                    'debit' => 0,
                    'credit' => $amount,
                    'description' => $description,
                ],
            ]
        );

        // 2. Record Depreciation Entry
        DepreciationEntry::create([
            'asset_id' => $asset->id,
            'gl_entry_id' => $journalEntry->id,
            'date' => $date->format('Y-m-d'),
            'amount' => $amount,
            'book_value_after' => $asset->book_value - $amount,
        ]);

        // Check if fully depreciated after this
        if ($asset->fresh()->book_value <= $asset->salvage_value) {
            $asset->update(['status' => 'fully_depreciated']);
        }
    }

    protected function calculateDepreciationAmount(Asset $asset): float
    {
        // Straight Line: (Cost - Salvage) / Useful Life (Months)
        $usefulLifeMonths = $asset->category->useful_life_years * 12;
        $depreciableAmount = $asset->cost - $asset->salvage_value;

        return round($depreciableAmount / $usefulLifeMonths, 2);
    }
}
