<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workflow extends Model
{
    protected $fillable = [
        'name',
        'module',
        'entity_type',
        'description',
        'is_active',
        'created_by',
        'version',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'version' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(WorkflowStep::class)->orderBy('step_number');
    }

    public function instances(): HasMany
    {
        return $this->hasMany(WorkflowInstance::class);
    }

    public function delegations(): HasMany
    {
        return $this->hasMany(WorkflowDelegation::class);
    }
}
