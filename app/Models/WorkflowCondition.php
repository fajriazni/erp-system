<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowCondition extends Model
{
    protected $fillable = [
        'workflow_step_id',
        'field_path',
        'operator',
        'value',
        'logical_operator',
        'group_number',
    ];

    protected $casts = [
        'value' => 'array',
        'group_number' => 'integer',
    ];

    public function workflowStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class);
    }
}
