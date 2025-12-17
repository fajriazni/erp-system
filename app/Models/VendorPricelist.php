<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorPricelist extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'product_id',
        'price',
        'min_quantity',
        'vendor_product_code',
        'vendor_product_name',
    ];

    public function vendor()
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
