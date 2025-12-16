<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Models\Role;

class ApprovalTask extends Model
{
    protected $fillable = [
        'workflow_instance_id',
        'workflow_step_id',
        'assigned_to_user_id',
        'assigned_to_role_id',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'comments',
        'due_at',
        'escalated_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'due_at' => 'datetime',
        'escalated_at' => 'datetime',
    ];

    public function workflowInstance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    public function workflowStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'assigned_to_role_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function escalations(): HasMany
    {
        return $this->hasMany(WorkflowEscalation::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(WorkflowNotification::class);
    }
}
