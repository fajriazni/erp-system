<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_request_id',
        'product_id',
        'description',
        'quantity',
        'uom_id',
        'estimated_unit_price',
        'estimated_total',
        'status',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class, 'purchase_request_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(Uom::class);
    }
}
