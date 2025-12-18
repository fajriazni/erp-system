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
        // Vendor Enhancement Fields
        'documents',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'bank_swift_code',
        'currency',
        'company_registration_no',
        'established_year',
        'employee_count',
        'website',
        'notes',
        'category',
        'industry',
        'tags',
        'contact_persons',
        'status',
    ];

    protected $casts = [
        'documents' => 'array',
        'tags' => 'array',
        'contact_persons' => 'array',
        'established_year' => 'integer',
        'employee_count' => 'integer',
        'rating_score' => 'decimal:2',
        'on_time_rate' => 'decimal:2',
        'quality_rate' => 'decimal:2',
        'return_rate' => 'decimal:2',
    ];

    public function paymentTerm()
    {
        return $this->belongsTo(PaymentTerm::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class, 'vendor_id');
    }

    public function onboarding()
    {
        return $this->hasOne(VendorOnboarding::class, 'vendor_id');
    }
    //
}
