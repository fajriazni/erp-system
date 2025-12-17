<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QcInspection extends Model
{
    protected $fillable = [
        'goods_receipt_item_id',
        'inspector_id',
        'passed_qty',
        'failed_qty',
        'notes',
        'checklist_results',
    ];

    protected function casts(): array
    {
        return [
            'checklist_results' => 'array',
        ];
    }

    public function goodsReceiptItem(): BelongsTo
    {
        return $this->belongsTo(GoodsReceiptItem::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    /**
     * Get the total quantity inspected.
     */
    public function getTotalQtyAttribute(): int
    {
        return $this->passed_qty + $this->failed_qty;
    }

    /**
     * Get the pass rate as percentage.
     */
    public function getPassRateAttribute(): float
    {
        $total = $this->total_qty;
        if ($total <= 0) {
            return 0;
        }

        return round(($this->passed_qty / $total) * 100, 2);
    }
}
