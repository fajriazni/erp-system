<?php

namespace App\Domain\Assets\Models;

use App\Models\ChartOfAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetCategory extends Model
{
    protected $guarded = [];

    public function assetAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'asset_account_id');
    }

    public function accumulatedDepreciationAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'accumulated_depreciation_account_id');
    }

    public function depreciationExpenseAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'depreciation_expense_account_id');
    }
}
