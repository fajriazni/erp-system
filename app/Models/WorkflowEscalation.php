<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowEscalation extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'approval_task_id',
        'escalated_from_user_id',
        'escalated_to_user_id',
        'escalation_level',
        'reason',
    ];

    protected $casts = [
        'escalation_level' => 'integer',
        'created_at' => 'datetime',
    ];

    public function approvalTask(): BelongsTo
    {
        return $this->belongsTo(ApprovalTask::class);
    }

    public function escalatedFrom(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_from_user_id');
    }

    public function escalatedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_to_user_id');
    }
}
