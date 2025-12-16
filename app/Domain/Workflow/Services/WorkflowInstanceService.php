<?php

namespace App\Domain\Workflow\Services;

use App\Models\Workflow;
use App\Models\WorkflowInstance;
use Illuminate\Database\Eloquent\Model;

class WorkflowInstanceService
{
    /**
     * Find active workflow for a given module and entity type
     */
    public function findWorkflowForEntity(string $module, string $entityType): ?Workflow
    {
        return Workflow::where('module', $module)
            ->where('entity_type', $entityType)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get active workflow instance for an entity
     */
    public function getActiveInstanceForEntity(Model $entity): ?WorkflowInstance
    {
        return WorkflowInstance::where('entity_type', get_class($entity))
            ->where('entity_id', $entity->id)
            ->whereIn('status', ['pending'])
            ->first();
    }

    /**
     * Check if entity has active workflow
     */
    public function hasActiveWorkflow(Model $entity): bool
    {
        return $this->getActiveInstanceForEntity($entity) !== null;
    }

    /**
     * Get workflow history for entity
     */
    public function getWorkflowHistory(Model $entity)
    {
        return WorkflowInstance::where('entity_type', get_class($entity))
            ->where('entity_id', $entity->id)
            ->with(['workflow', 'initiator', 'auditLogs.user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
