<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorQuotationLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_quotation_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal',
        'notes',
    ];

    public function quotation()
    {
        return $this->belongsTo(VendorQuotation::class, 'vendor_quotation_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
