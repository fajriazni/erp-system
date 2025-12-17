<?php

namespace App\Domain\Approval\Services;

use App\Models\ApprovalRequest;
use App\Models\ApprovalRule;
use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ApprovalMatrixService
{
    /**
     * Get required approvers for an entity based on amount.
     *
     * @return Collection<ApprovalRule>
     */
    public function getRequiredApprovers(string $entityType, float $amount): Collection
    {
        return ApprovalRule::forAmount($entityType, $amount)->get();
    }

    /**
     * Submit an entity for approval.
     * Creates approval requests for all required approvers.
     */
    public function submitForApproval(Model $entity, float $amount): void
    {
        $entityType = $this->getEntityType($entity);
        $rules = $this->getRequiredApprovers($entityType, $amount);

        if ($rules->isEmpty()) {
            // No approval required, auto-approve
            return;
        }

        DB::transaction(function () use ($entity, $rules) {
            foreach ($rules as $rule) {
                $approver = $rule->approver;

                if (! $approver) {
                    continue;
                }

                ApprovalRequest::create([
                    'approvable_type' => get_class($entity),
                    'approvable_id' => $entity->id,
                    'approval_rule_id' => $rule->id,
                    'approver_id' => $approver->id,
                    'level' => $rule->level,
                    'status' => 'pending',
                ]);
            }

            // Update entity status to pending_approval if it has the field
            if (method_exists($entity, 'markPendingApproval')) {
                $entity->markPendingApproval();
            }
        });
    }

    /**
     * Approve an approval request.
     */
    public function approve(ApprovalRequest $request, ?string $notes = null): void
    {
        if (! $request->isPending()) {
            throw new Exception('This approval request has already been processed.');
        }

        DB::transaction(function () use ($request, $notes) {
            $request->update([
                'status' => 'approved',
                'notes' => $notes,
                'responded_at' => now(),
            ]);

            // Check if all levels are approved
            $entity = $request->approvable;
            $pendingCount = ApprovalRequest::where('approvable_type', get_class($entity))
                ->where('approvable_id', $entity->id)
                ->pending()
                ->count();

            if ($pendingCount === 0 && method_exists($entity, 'markApproved')) {
                $entity->markApproved();
            }
        });
    }

    /**
     * Reject an approval request.
     */
    public function reject(ApprovalRequest $request, string $reason): void
    {
        if (! $request->isPending()) {
            throw new Exception('This approval request has already been processed.');
        }

        DB::transaction(function () use ($request, $reason) {
            $request->update([
                'status' => 'rejected',
                'notes' => $reason,
                'responded_at' => now(),
            ]);

            // Mark entity as rejected
            $entity = $request->approvable;
            if (method_exists($entity, 'markRejected')) {
                $entity->markRejected($reason);
            }
        });
    }

    /**
     * Get pending approval requests for a user.
     *
     * @return Collection<ApprovalRequest>
     */
    public function getPendingForUser(User $user): Collection
    {
        return ApprovalRequest::forApprover($user->id)
            ->pending()
            ->with(['approvable', 'approvalRule'])
            ->latest()
            ->get();
    }

    /**
     * Check if entity requires approval.
     */
    public function requiresApproval(string $entityType, float $amount): bool
    {
        return ApprovalRule::forAmount($entityType, $amount)->exists();
    }

    /**
     * Get entity type string from model.
     */
    private function getEntityType(Model $entity): string
    {
        return match (get_class($entity)) {
            'App\\Models\\PurchaseRequest' => 'purchase_request',
            'App\\Models\\PurchaseOrder' => 'purchase_order',
            'App\\Models\\Expense' => 'expense',
            'App\\Models\\VendorBill' => 'vendor_bill',
            default => strtolower(class_basename($entity)),
        };
    }
}
