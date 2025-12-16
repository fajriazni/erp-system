<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WorkflowInstance extends Model
{
    protected $fillable = [
        'workflow_id',
        'entity_type',
        'entity_id',
        'current_step_id',
        'status',
        'initiated_by',
        'initiated_at',
        'completed_at',
    ];

    protected $casts = [
        'entity_id' => 'integer',
        'initiated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'current_step_id');
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function entity(): MorphTo
    {
        return $this->morphTo();
    }

    public function approvalTasks(): HasMany
    {
        return $this->hasMany(ApprovalTask::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(WorkflowAuditLog::class)->orderBy('created_at');
    }
}
