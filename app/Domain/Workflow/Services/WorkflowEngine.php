<?php

namespace App\Domain\Workflow\Services;

use App\Models\ApprovalTask;
use App\Models\Workflow;
use App\Models\WorkflowAuditLog;
use App\Models\WorkflowInstance;
use App\Models\WorkflowStep;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class WorkflowEngine
{
    public function __construct(
        protected ConditionEvaluator $conditionEvaluator,
        protected WorkflowInstanceService $instanceService
    ) {}

    /**
     * Start a workflow for a given entity
     */
    public function startWorkflow(Workflow $workflow, Model $entity, int $initiatedBy): WorkflowInstance
    {
        return DB::transaction(function () use ($workflow, $entity, $initiatedBy) {
            // Create workflow instance
            $instance = WorkflowInstance::create([
                'workflow_id' => $workflow->id,
                'entity_type' => get_class($entity),
                'entity_id' => $entity->id,
                'status' => 'pending',
                'initiated_by' => $initiatedBy,
                'initiated_at' => now(),
            ]);

            // Log action
            $this->logAction($instance, $initiatedBy, 'initiated', null, 'pending');

            // Start first step
            $this->processNextStep($instance, $entity);

            return $instance->fresh();
        });
    }

    /**
     * Process the next step in the workflow
     */
    public function processNextStep(WorkflowInstance $instance, ?Model $entity = null): void
    {
        if (! $entity) {
            $entity = $instance->entity;
        }

        $workflow = $instance->workflow;
        $currentStepNumber = $instance->currentStep?->step_number ?? 0;

        // Find next applicable step
        $nextStep = $this->findNextApplicableStep($workflow, $entity, $currentStepNumber);

        if (! $nextStep) {
            // No more steps - workflow complete
            $this->completeWorkflow($instance);

            return;
        }

        // Update current step
        $instance->update(['current_step_id' => $nextStep->id]);

        // Create approval tasks for this step
        $this->createApprovalTasks($instance, $nextStep, $entity);
    }

    /**
     * Find the next applicable step based on conditions
     */
    protected function findNextApplicableStep(Workflow $workflow, Model $entity, int $currentStepNumber): ?WorkflowStep
    {
        $steps = $workflow->steps()->where('step_number', '>', $currentStepNumber)->get();

        foreach ($steps as $step) {
            if ($this->conditionEvaluator->evaluateStepConditions($step, $entity)) {
                return $step;
            }
        }

        return null;
    }

    /**
     * Create approval tasks for a workflow step
     */
    protected function createApprovalTasks(WorkflowInstance $instance, WorkflowStep $step, Model $entity): void
    {
        // Check for Auto-Approval Rules
        if ($this->checkAutoApproval($instance, $step)) {
            $this->logAction($instance, null, 'step_auto_approved', null, null, [
                'step_id' => $step->id,
                'reason' => 'Auto-approval rules met',
            ]);
            // Assuming transitionToNextStep is a new method or processNextStep is called
            $this->processNextStep($instance, $entity); // Call processNextStep to move to the next step

            return;
        }

        $config = $step->config;
        $approvers = $config['approvers'] ?? [];

        $tasks = [];
        $dueAt = $step->sla_hours ? now()->addHours($step->sla_hours) : null;

        // Resolve approvers based on type
        switch ($approvers['type'] ?? 'user') {
            case 'role':
                foreach ($approvers['role_ids'] ?? [] as $roleId) {
                    $tasks[] = [
                        'workflow_instance_id' => $instance->id,
                        'workflow_step_id' => $step->id,
                        'assigned_to_role_id' => $roleId,
                        'assigned_to_user_id' => null,
                        'status' => 'pending',
                        'due_at' => $dueAt,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                break;

            case 'user':
                foreach ($approvers['user_ids'] ?? [] as $userId) {
                    $tasks[] = [
                        'workflow_instance_id' => $instance->id,
                        'workflow_step_id' => $step->id,
                        'assigned_to_user_id' => $userId,
                        'assigned_to_role_id' => null,
                        'status' => 'pending',
                        'due_at' => $dueAt,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                break;

            case 'dynamic':
                // Resolve dynamic field (e.g., created_by.department.manager_id)
                $userId = $this->resolveDynamicField($entity, $approvers['field'] ?? '');
                if ($userId) {
                    $tasks[] = [
                        'workflow_instance_id' => $instance->id,
                        'workflow_step_id' => $step->id,
                        'assigned_to_user_id' => $userId,
                        'assigned_to_role_id' => null,
                        'status' => 'pending',
                        'due_at' => $dueAt,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                break;
        }

        if (empty($tasks)) {
            // No approvers found for this step.
            // We should either skip this step or fail.
            // For now, let's assume if no approvers, we skip to next step (auto-approve/pass-through).
            $this->logAction($instance, null, 'step_skipped', 'pending', 'skipped', [
                'step_id' => $step->id,
                'reason' => 'No approvers found',
            ]);

            $this->processNextStep($instance, $entity);

            return;
        }

        ApprovalTask::insert($tasks);

        // Process Self-Approval or Auto-Approval if needed
        // We need to fetch the created tasks to process them
        $createdTasks = ApprovalTask::where('workflow_instance_id', $instance->id)
            ->where('workflow_step_id', $step->id)
            ->where('status', 'pending')
            ->get();

        foreach ($createdTasks as $task) {
            // Check for Self-Approval
            // If assigned to user and that user is the initiator, and self-approval is allowed
            // Config: allow_self_approval = true/false (default false)
            $allowSelfApproval = $step->config['allow_self_approval'] ?? false;

            if ($task->assigned_to_user_id &&
                $task->assigned_to_user_id === $instance->initiated_by &&
                $allowSelfApproval
            ) {
                // Auto approve
                $approvalService = app(\App\Domain\Workflow\Services\ApprovalService::class);
                $approvalService->approve($task, $task->assigned_to_user_id, 'Auto-approved (Self Approval)');
            } else {
                // Send notification
                if ($task->assigned_to_user_id) {
                    $user = \App\Models\User::find($task->assigned_to_user_id);
                    if ($user) {
                        $user->notify(new \App\Notifications\WorkflowTaskAssignedNotification($task));
                    }
                }
            }
        }
    }

    /**
     * Resolve dynamic field from entity
     */
    protected function resolveDynamicField(Model $entity, string $fieldPath): mixed
    {
        $parts = explode('.', $fieldPath);
        $value = $entity;

        foreach ($parts as $part) {
            if (! $value) {
                return null;
            }

            $value = $value->$part ?? null;
        }

        return $value;
    }

    /**
     * Complete the workflow
     */
    protected function completeWorkflow(WorkflowInstance $instance): void
    {
        DB::transaction(function () use ($instance) {
            $instance->update([
                'status' => 'approved',
                'completed_at' => now(),
            ]);

            $this->logAction($instance, null, 'completed', 'pending', 'approved');

            // Notify Entity
            $entity = $instance->entity;
            if ($entity instanceof \App\Domain\Workflow\Contracts\HasWorkflow) {
                $entity->onWorkflowApproved();
            }
        });
    }

    /**
     * Reject the workflow
     */
    public function rejectWorkflow(WorkflowInstance $instance, int $userId, string $reason): void
    {
        DB::transaction(function () use ($instance, $userId, $reason) {
            $instance->update([
                'status' => 'rejected',
                'completed_at' => now(),
            ]);

            $this->logAction($instance, $userId, 'rejected', $instance->status, 'rejected', [
                'reason' => $reason,
            ]);

            // Notify Entity
            $entity = $instance->entity;
            if ($entity instanceof \App\Domain\Workflow\Contracts\HasWorkflow) {
                $entity->onWorkflowRejected($reason);
            }
        });
    }

    /**
     * Cancel the workflow
     */
    public function cancelWorkflow(WorkflowInstance $instance, int $userId, string $reason): void
    {
        DB::transaction(function () use ($instance, $userId, $reason) {
            $instance->update([
                'status' => 'cancelled',
                'completed_at' => now(),
            ]);

            $this->logAction($instance, $userId, 'cancelled', $instance->status, 'cancelled', [
                'reason' => $reason,
            ]);
        });
    }

    /**
     * Log workflow action
     */
    public function logAction(
        WorkflowInstance $instance,
        ?int $userId,
        string $action,
        ?string $fromStatus,
        ?string $toStatus,
        array $metadata = []
    ): void {
        WorkflowAuditLog::create([
            'workflow_instance_id' => $instance->id,
            'user_id' => $userId,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Check if the step should be auto-approved based on rules
     */
    protected function checkAutoApproval(WorkflowInstance $instance, WorkflowStep $step): bool
    {
        $rules = $step->config['auto_approval_rules'] ?? [];
        if (empty($rules)) {
            return false;
        }

        $entity = $instance->entity;
        if (! $entity) {
            return false;
        }

        foreach ($rules as $rule) {
            $field = $rule['field']; // e.g., 'total_amount'
            $operator = $rule['operator']; // e.g., '>', '<', '=', '!='
            $value = $rule['value'];

            $entityValue = data_get($entity, $field);

            if (! $this->evaluateCondition($entityValue, $operator, $value)) {
                return false;
            }
        }

        return true;
    }

    protected function evaluateCondition($actual, $operator, $expected): bool
    {
        return match ($operator) {
            '=' => $actual == $expected,
            '==' => $actual == $expected,
            '===' => $actual === $expected,
            '!=' => $actual != $expected,
            '!==' => $actual !== $expected,
            '>' => $actual > $expected,
            '<' => $actual < $expected,
            '>=' => $actual >= $expected,
            '<=' => $actual <= $expected,
            'in' => in_array($actual, (array) $expected),
            default => false,
        };
    }
}
