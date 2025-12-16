<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorBillItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_bill_id',
        'product_id',
        'description',
        'quantity',
        'unit_price',
        'total',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function bill()
    {
        return $this->belongsTo(VendorBill::class, 'vendor_bill_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
