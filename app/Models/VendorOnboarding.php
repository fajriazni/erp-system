<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorOnboarding extends Model
{
    protected $table = 'vendor_onboarding';

    protected $fillable = [
        'vendor_id',
        'status',
        'documents',
        'checklist',
        'notes',
        'reviewed_by',
        'reviewed_at',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
            'checklist' => 'array',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_IN_REVIEW = 'in_review';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    // Default checklist items
    public static function getDefaultChecklist(): array
    {
        return [
            'business_license' => ['label' => 'Business License Uploaded', 'completed' => false],
            'tax_certificate' => ['label' => 'Tax Certificate Uploaded', 'completed' => false],
            'bank_details' => ['label' => 'Bank Details Verified', 'completed' => false],
            'quality_standards' => ['label' => 'Quality Standards Agreement', 'completed' => false],
            'payment_terms' => ['label' => 'Payment Terms Confirmed', 'completed' => false],
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
