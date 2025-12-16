<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowNotification extends Model
{
    protected $fillable = [
        'approval_task_id',
        'user_id',
        'type',
        'status',
        'sent_at',
        'error_message',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function approvalTask(): BelongsTo
    {
        return $this->belongsTo(ApprovalTask::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
