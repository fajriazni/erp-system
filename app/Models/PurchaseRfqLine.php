<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseRfqLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_rfq_id',
        'product_id',
        'quantity',
        'uom_id',
        'target_price',
        'notes',
    ];

    public function rfq()
    {
        return $this->belongsTo(PurchaseRfq::class, 'purchase_rfq_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function uom()
    {
        return $this->belongsTo(Uom::class);
    }
}
