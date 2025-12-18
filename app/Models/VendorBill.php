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
        'match_status',
        'match_exceptions',
        'total_amount',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'withholding_tax_rate',
        'withholding_tax_amount',
        'tax_inclusive',
        'notes',
        'attachment_path',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'withholding_tax_rate' => 'decimal:2',
        'withholding_tax_amount' => 'decimal:2',
        'tax_inclusive' => 'boolean',
        'match_exceptions' => 'array',
    ];

    protected $appends = [
        'amount_paid',
        'balance_due',
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

    public function paymentLines()
    {
        return $this->hasMany(VendorPaymentLine::class);
    }

    public function getAmountPaidAttribute()
    {
        return $this->paymentLines()->sum('amount');
    }

    public function getBalanceDueAttribute()
    {
        return $this->total_amount - $this->amount_paid;
    }
}
