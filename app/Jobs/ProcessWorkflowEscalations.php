<?php

namespace App\Jobs;

use App\Models\ApprovalTask;
use App\Models\User;
use App\Models\WorkflowEscalation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessWorkflowEscalations implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Find overdue tasks that haven't been escalated
        $overdueApprovals = ApprovalTask::where('status', 'pending')
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->whereNull('escalated_at')
            ->with(['workflowStep', 'user', 'workflowInstance'])
            ->get();

        foreach ($overdueApprovals as $task) {
            $this->escalateTask($task);
        }
    }

    protected function escalateTask(ApprovalTask $task): void
    {
        // Find escalation target (could be manager, admin, etc.)
        $escalationTarget = $this->findEscalationTarget($task);

        if (! $escalationTarget) {
            return;
        }

        // Create escalation record
        WorkflowEscalation::create([
            'approval_task_id' => $task->id,
            'escalated_from_user_id' => $task->assigned_to_user_id,
            'escalated_to_user_id' => $escalationTarget->id,
            'escalation_level' => 1,
            'reason' => 'SLA breach - task overdue',
            'created_at' => now(),
        ]);

        // Mark task as escalated
        $task->update(['escalated_at' => now()]);

        // Create new task for escalation target
        $newTask = ApprovalTask::create([
            'workflow_instance_id' => $task->workflow_instance_id,
            'workflow_step_id' => $task->workflow_step_id,
            'assigned_to_user_id' => $escalationTarget->id,
            'status' => 'pending',
            'due_at' => now()->addHours(24),
        ]);

        // Send notification to escalation target
        $escalationTarget->notify(new \App\Notifications\WorkflowTaskAssignedNotification($newTask));
    }

    protected function findEscalationTarget(ApprovalTask $task): ?User
    {
        // Simple escalation: find users with higher role
        // In production, this should be configurable per workflow
        return User::role(['admin', 'director', 'ceo'])->first();
    }
}
