<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowAuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'workflow_instance_id',
        'user_id',
        'action',
        'from_status',
        'to_status',
        'metadata',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function workflowInstance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
