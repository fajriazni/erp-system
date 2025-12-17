<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorQuotation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'purchase_rfq_id',
        'vendor_id',
        'reference_number', // Using reference_number as quote_number
        'quote_date', // Ensure this column exists? Migration had quote_date?
        'valid_until',
        'total_amount',
        'currency',
        'is_awarded',
        'notes',
        'status',
        'awarded_at',
        'purchase_order_id',
    ];

    protected $casts = [
        'valid_until' => 'date',
        'awarded_at' => 'datetime',
    ];

    public function rfq()
    {
        return $this->belongsTo(PurchaseRfq::class, 'purchase_rfq_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function lines()
    {
        return $this->hasMany(VendorQuotationLine::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
