<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowDelegation extends Model
{
    protected $fillable = [
        'delegator_user_id',
        'delegate_user_id',
        'workflow_id',
        'start_date',
        'end_date',
        'reason',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function delegator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delegator_user_id');
    }

    public function delegate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delegate_user_id');
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
}
