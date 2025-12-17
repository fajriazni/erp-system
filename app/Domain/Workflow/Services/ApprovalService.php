<?php

namespace App\Domain\Workflow\Services;

use App\Models\ApprovalTask;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    public function __construct(
        protected WorkflowEngine $workflowEngine
    ) {}

    /**
     * Approve an approval task
     */
    public function approve(ApprovalTask $task, int $userId, ?string $comments = null): void
    {
        DB::transaction(function () use ($task, $userId, $comments) {
            // Update task
            $task->update([
                'status' => 'approved',
                'approved_by' => $userId,
                'approved_at' => now(),
                'comments' => $comments,
            ]);

            // Log action
            $this->workflowEngine->logAction(
                $task->workflowInstance,
                $userId,
                'task_approved',
                'pending',
                'approved',
                [
                    'task_id' => $task->id,
                    'step_name' => $task->workflowStep->name,
                    'comments' => $comments,
                ]
            );

            // Check if all tasks in step are complete
            $this->checkStepCompletion($task);
        });
    }

    /**
     * Reject an approval task
     */
    public function reject(ApprovalTask $task, int $userId, string $reason, ?string $comments = null): void
    {
        DB::transaction(function () use ($task, $userId, $reason, $comments) {
            // Update task
            $task->update([
                'status' => 'rejected',
                'approved_by' => $userId,
                'approved_at' => now(),
                'rejection_reason' => $reason,
                'comments' => $comments,
            ]);

            // Log action
            $this->workflowEngine->logAction(
                $task->workflowInstance,
                $userId,
                'task_rejected',
                'pending',
                'rejected',
                [
                    'task_id' => $task->id,
                    'step_name' => $task->workflowStep->name,
                    'reason' => $reason,
                    'comments' => $comments,
                ]
            );

            // Reject entire workflow
            $this->workflowEngine->rejectWorkflow($task->workflowInstance, $userId, $reason);
        });
    }

    /**
     * Delegate an approval task
     */
    public function delegate(ApprovalTask $task, int $delegateToUserId, int $delegatedBy, ?string $reason = null): void
    {
        $fromUser = \App\Models\User::findOrFail($delegatedBy);
        $toUser = \App\Models\User::findOrFail($delegateToUserId);

        // Use DelegationService to handle the delegation
        // We instantiate it here or we should inject it.
        // For now, let's instantiate or resolve it to avoid constructor breaking changes if possible,
        // but cleaner is injection. Let's assume we can resolve it.
        $delegationService = app(DelegationService::class);

        $delegationService->delegate($task, $fromUser, $toUser, $reason);
    }

    /**
     * Check if all tasks in the current step are complete
     */
    protected function checkStepCompletion(ApprovalTask $task): void
    {
        $instance = $task->workflowInstance;
        $stepId = $task->workflow_step_id;

        // Get step config
        $step = $task->workflowStep;
        $approvalType = $step->config['approval_type'] ?? 'all';

        // Get all tasks for this step
        $allTasks = ApprovalTask::where('workflow_instance_id', $instance->id)
            ->where('workflow_step_id', $stepId)
            ->whereIn('status', ['pending', 'approved', 'rejected'])
            ->get();

        $approvedCount = $allTasks->where('status', 'approved')->count();
        $totalCount = $allTasks->count();

        $stepComplete = match ($approvalType) {
            'any_one' => $approvedCount >= 1,
            'majority' => $approvedCount > ($totalCount / 2),
            'all' => $approvedCount === $totalCount,
            default => $approvedCount === $totalCount,
        };

        if ($stepComplete) {
            // Cancel/Skip other pending tasks in this step
            ApprovalTask::where('workflow_instance_id', $instance->id)
                ->where('workflow_step_id', $stepId)
                ->where('status', 'pending')
                ->update(['status' => 'skipped', 'updated_at' => now()]);

            // Move to next step
            $this->workflowEngine->processNextStep($instance);
        }
    }

    /**
     * Get pending approval tasks for a user
     */
    public function getPendingTasksForUser(int $userId)
    {
        return ApprovalTask::where('assigned_to_user_id', $userId)
            ->where('status', 'pending')
            ->with(['workflowInstance.entity', 'workflowStep', 'workflowInstance.workflow'])
            ->orderBy('due_at')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get pending approval tasks for a role
     */
    public function getPendingTasksForRole(int $roleId)
    {
        return ApprovalTask::where('assigned_to_role_id', $roleId)
            ->where('status', 'pending')
            ->with(['workflowInstance.entity', 'workflowStep', 'workflowInstance.workflow'])
            ->orderBy('due_at')
            ->orderBy('created_at')
            ->get();
    }
}
