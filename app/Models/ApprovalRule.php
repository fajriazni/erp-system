<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Models\Role;

class ApprovalRule extends Model
{
    protected $fillable = [
        'name',
        'entity_type',
        'min_amount',
        'max_amount',
        'role_id',
        'user_id',
        'level',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_amount' => 'decimal:2',
            'max_amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvalRequests(): HasMany
    {
        return $this->hasMany(ApprovalRequest::class);
    }

    /**
     * Get the approver (user or first user with role).
     */
    public function getApproverAttribute(): ?User
    {
        if ($this->user_id) {
            return $this->user;
        }

        if ($this->role_id) {
            return User::role($this->role->name)->first();
        }

        return null;
    }

    /**
     * Scope to get active rules for an entity type and amount.
     */
    public function scopeForAmount($query, string $entityType, float $amount)
    {
        return $query->where('entity_type', $entityType)
            ->where('is_active', true)
            ->where('min_amount', '<=', $amount)
            ->where(function ($q) use ($amount) {
                $q->whereNull('max_amount')
                    ->orWhere('max_amount', '>=', $amount);
            })
            ->orderBy('level');
    }
}
