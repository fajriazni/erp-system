<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ApprovalRequest extends Model
{
    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'approval_rule_id',
        'approver_id',
        'level',
        'status',
        'notes',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }

    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    public function approvalRule(): BelongsTo
    {
        return $this->belongsTo(ApprovalRule::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForApprover($query, int $userId)
    {
        return $query->where('approver_id', $userId);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}
