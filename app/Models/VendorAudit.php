<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorAudit extends Model
{
    protected $fillable = [
        'vendor_id',
        'audit_type',
        'audit_date',
        'auditor_id',
        'score',
        'status',
        'criteria_scores',
        'findings',
        'recommendations',
        'next_audit_date',
    ];

    protected function casts(): array
    {
        return [
            'audit_date' => 'date',
            'next_audit_date' => 'date',
            'criteria_scores' => 'array',
            'score' => 'decimal:2',
        ];
    }

    // Audit types
    const TYPE_INITIAL = 'initial';
    const TYPE_PERIODIC = 'periodic';
    const TYPE_QUALITY = 'quality';
    const TYPE_COMPLIANCE = 'compliance';

    // Statuses
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';

    // Default audit criteria
    public static function getDefaultCriteria(): array
    {
        return [
            'quality_management' => ['label' => 'Quality Management System', 'weight' => 25],
            'financial_stability' => ['label' => 'Financial Stability', 'weight' => 20],
            'delivery_capability' => ['label' => 'Delivery Capability', 'weight' => 20],
            'technical_capability' => ['label' => 'Technical Capability', 'weight' => 20],
            'compliance' => ['label' => 'Regulatory Compliance', 'weight' => 15],
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }
}
