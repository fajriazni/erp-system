<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ApprovalTask;
use App\Models\User;

class ApprovalTaskDelegation extends Model
{
    protected $fillable = [
        'approval_task_id',
        'from_user_id',
        'to_user_id',
        'delegated_at',
        'expires_at',
        'reason',
        'created_by',
    ];

    protected $casts = [
        'delegated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(ApprovalTask::class, 'approval_task_id');
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
