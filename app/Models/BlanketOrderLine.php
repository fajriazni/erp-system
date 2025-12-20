<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlanketOrderLine extends Model
{
    protected $fillable = [
        'blanket_order_id',
        'product_id',
        'unit_price',
        'quantity_agreed',
        'quantity_ordered',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity_agreed' => 'decimal:2',
        'quantity_ordered' => 'decimal:2',
    ];

    public function blanketOrder()
    {
        return $this->belongsTo(BlanketOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
