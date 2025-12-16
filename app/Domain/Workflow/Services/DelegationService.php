<?php

namespace App\Domain\Workflow\Services;

use App\Models\ApprovalTask;
use App\Models\ApprovalTaskDelegation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class DelegationService
{
    /**
     * Delegate an approval task to another user
     */
    public function delegate(ApprovalTask $task, User $fromUser, User $toUser, ?string $reason = null, ?string $expiresAt = null): ApprovalTaskDelegation
    {
        // 1. Validation
        if ($task->status !== 'pending') {
            throw new Exception("Cannot delegate a task that is not pending.");
        }

        // 2. Create Delegation Record
        return DB::transaction(function () use ($task, $fromUser, $toUser, $reason, $expiresAt) {
            $delegation = ApprovalTaskDelegation::create([
                'approval_task_id' => $task->id,
                'from_user_id' => $fromUser->id,
                'to_user_id' => $toUser->id,
                'delegated_at' => now(),
                'expires_at' => $expiresAt,
                'reason' => $reason,
                'created_by' => auth()->id() ?? $fromUser->id,
            ]);

            // 3. Update Task Assignment
            // We update the assigned user to the new user so it shows up in their queue
            $task->update([
                'assigned_to_user_id' => $toUser->id,
            ]);

            // 4. Log to Audit Log (using Workflow audit)
            $task->workflowInstance->auditLogs()->create([
                'action' => 'task_delegated',
                'user_id' => $fromUser->id,
                'metadata' => [
                    'to_user' => $toUser->name,
                    'reason' => $reason,
                    'original_assignee' => $fromUser->name,
                ],
            ]);

            return $delegation;
        });
    }

    /**
     * Revoke delegation (revert to original user)
     */
    public function revoke(ApprovalTaskDelegation $delegation, User $performedBy): void
    {
        DB::transaction(function () use ($delegation, $performedBy) {
            $task = $delegation->task;
            
            if ($task->status !== 'pending') {
                throw new Exception("Cannot revoke delegation for a completed task.");
            }

            // Revert assignment
            $task->update([
                'assigned_to_user_id' => $delegation->from_user_id,
            ]);

            // Mark delegation as expired/revoked
            $delegation->update(['expires_at' => now()]);

            // Log
            // Check if workflowInstance exists (it should)
            if ($task->workflowInstance) {
                $task->workflowInstance->auditLogs()->create([
                    'action' => 'delegation_revoked',
                    'user_id' => $performedBy->id,
                    'metadata' => [
                        'reverted_to' => $delegation->fromUser->name,
                    ],
                ]);
            }
        });
    }
}
