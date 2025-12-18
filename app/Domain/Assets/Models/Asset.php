<?php

namespace App\Domain\Assets\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    protected $guarded = [];

    protected $casts = [
        'purchase_date' => 'date',
        'start_depreciation_date' => 'date',
        'cost' => 'decimal:2',
        'salvage_value' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function depreciationEntries(): HasMany
    {
        return $this->hasMany(DepreciationEntry::class);
    }

    /**
     * Get the current book value of the asset.
     */
    public function getBookValueAttribute(): float
    {
        $accumulatedDepreciation = $this->depreciationEntries()->sum('amount');

        return $this->cost - $accumulatedDepreciation;
    }
}
