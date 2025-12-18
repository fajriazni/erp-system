<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryCountLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_count_id',
        'product_id',
        'theoretical_qty',
        'counted_qty',
        'notes',
    ];

    protected $casts = [
        'theoretical_qty' => 'decimal:2',
        'counted_qty' => 'decimal:2',
    ];

    public function inventoryCount()
    {
        return $this->belongsTo(InventoryCount::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
