<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'vendor_id',
        'date',
        'amount',
        'reference',
        'payment_method',
        'notes',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(VendorPaymentLine::class);
    }
}
