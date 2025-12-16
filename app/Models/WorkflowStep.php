<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowStep extends Model
{
    protected $fillable = [
        'workflow_id',
        'step_number',
        'name',
        'step_type',
        'config',
        'sla_hours',
    ];

    protected $casts = [
        'config' => 'array',
        'step_number' => 'integer',
        'sla_hours' => 'integer',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(WorkflowCondition::class);
    }

    public function approvalTasks(): HasMany
    {
        return $this->hasMany(ApprovalTask::class);
    }
}
