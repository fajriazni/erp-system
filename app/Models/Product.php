<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'price',
        'cost',
        'stock_control',
        'uom_id',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'stock_control' => 'boolean',
    ];

    public function uom(): BelongsTo
    {
        return $this->belongsTo(Uom::class);
    }
}
