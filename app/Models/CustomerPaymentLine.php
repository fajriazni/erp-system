<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerPaymentLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_payment_id',
        'customer_invoice_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function payment()
    {
        return $this->belongsTo(CustomerPayment::class, 'customer_payment_id');
    }

    public function invoice()
    {
        return $this->belongsTo(CustomerInvoice::class, 'customer_invoice_id');
    }
}
