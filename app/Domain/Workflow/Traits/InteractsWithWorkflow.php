<?php

namespace App\Domain\Workflow\Traits;

use App\Models\WorkflowInstance;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

trait InteractsWithWorkflow
{
    /**
     * Get all workflow instances for this entity.
     */
    public function workflowInstances(): MorphMany
    {
        return $this->morphMany(WorkflowInstance::class, 'entity');
    }

    /**
     * Get the currently active (running) workflow instance.
     */
    public function activeWorkflowInstance(): MorphOne
    {
        return $this->morphOne(WorkflowInstance::class, 'entity')
            ->where('status', 'pending')
            ->latest();
    }

    /**
     * Get the latest workflow instance (regardless of status).
     */
    public function latestWorkflow(): MorphOne
    {
        return $this->morphOne(WorkflowInstance::class, 'entity')->latestOfMany();
    }
}
