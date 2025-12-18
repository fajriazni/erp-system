<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'email',
        'phone',
        'address',
        'tax_id',
        'payment_term_id',
        'rating_score',
        'on_time_rate',
        'quality_rate',
        'return_rate',
        'last_score_update',
    ];

    public function paymentTerm()
    {
        return $this->belongsTo(PaymentTerm::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class, 'vendor_id');
    }
    //
}
