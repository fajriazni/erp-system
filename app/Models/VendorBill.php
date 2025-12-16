<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorBill extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'vendor_id',
        'bill_number',
        'reference_number',
        'date',
        'due_date',
        'status',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function items()
    {
        return $this->hasMany(VendorBillItem::class);
    }
}
