<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\AssetCategory;
use Illuminate\Support\Facades\DB;

class CreateAssetService
{
    public function execute(array $data): Asset
    {
        return DB::transaction(function () use ($data) {
            $category = AssetCategory::findOrFail($data['category_id']);

            $asset = Asset::create([
                'name' => $data['name'],
                'asset_number' => $data['asset_number'],
                'category_id' => $category->id,
                'purchase_date' => $data['purchase_date'],
                'start_depreciation_date' => $data['start_depreciation_date'] ?? $data['purchase_date'],
                'cost' => $data['cost'],
                'salvage_value' => $data['salvage_value'] ?? 0,
                'status' => 'draft',
                'serial_number' => $data['serial_number'] ?? null,
                'location' => $data['location'] ?? null,
            ]);

            return $asset;
        });
    }
}
