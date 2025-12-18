<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'goods_receipt_id',
        'product_id',
        'uom_id',
        'quantity_received',
        'notes',
        'qc_status',
        'qc_passed_qty',
        'qc_failed_qty',
        'qc_notes',
        'qc_by',
        'qc_at',
    ];

    protected $casts = [
        'quantity_received' => 'decimal:2',
    ];

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(Uom::class);
    }

    public function inspections()
    {
        return $this->morphMany(QcInspection::class, 'inspectable');
    }
}
