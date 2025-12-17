<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandedCostAllocation extends Model
{
    protected $fillable = [
        'landed_cost_id',
        'goods_receipt_item_id',
        'allocated_amount',
    ];

    protected function casts(): array
    {
        return [
            'allocated_amount' => 'decimal:2',
        ];
    }

    public function landedCost(): BelongsTo
    {
        return $this->belongsTo(LandedCost::class);
    }

    public function goodsReceiptItem(): BelongsTo
    {
        return $this->belongsTo(GoodsReceiptItem::class);
    }
}
