<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseRfq extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'document_number',
        'title',
        'deadline',
        'status',
        'user_id',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lines()
    {
        return $this->hasMany(PurchaseRfqLine::class);
    }

    public function vendors()
    {
        return $this->belongsToMany(Contact::class, 'rfq_vendors', 'purchase_rfq_id', 'vendor_id')
            ->withTimestamps();
    }
    
    // Legacy support if needed, or alias
    public function invitedVendors()
    {
         return $this->vendors();
    }

    public function quotations()
    {
        return $this->hasMany(VendorQuotation::class);
    }
}
