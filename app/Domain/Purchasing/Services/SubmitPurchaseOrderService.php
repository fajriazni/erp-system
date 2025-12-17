<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\PurchaseOrder;
use App\Models\Workflow;
use Illuminate\Support\Facades\DB;

class SubmitPurchaseOrderService
{
    public function __construct(
        private WorkflowEngine $workflowEngine,
        private \App\Domain\Approval\Services\ApprovalMatrixService $approvalService
    ) {}

    public function execute(int $purchaseOrderId): void
    {
        DB::transaction(function () use ($purchaseOrderId) {
            $purchaseOrder = PurchaseOrder::with('items', 'vendor')->findOrFail($purchaseOrderId);

            // Calculate total if not set or ensure it is up to date
            $totalAmount = $purchaseOrder->items->sum('subtotal');
            if ($purchaseOrder->total != $totalAmount) {
                $purchaseOrder->update(['total' => $totalAmount]);
            }

            // Domain logic handles validation and state transition
            $purchaseOrder->submit();

            // Check for approval
            if ($this->approvalService->requiresApproval('purchase_order', $totalAmount)) {
                $this->approvalService->submitForApproval($purchaseOrder, $totalAmount);
                // Status update handled by approve service logic (markPendingApproval)
            } else {
                // If no approval required, does it go to straight to purchase_order (open)?
                // Or does it follow standard workflow engine if defined?
                // The original code started a workflow engine process.
                // We should probably keep the workflow engine for "audit" or "process tracking" if it's separate from approval matrix.
                // BUT the requirements say "Dynamic Approval Matrix ... replaces or integrates with workflow".
                // If ApprovalMatrixService handles the approval requests, maybe we don't need the old WorkflowEngine logic here OR we trigger it for other purposes.
                // Let's assume ApprovalMatrixService is the new way.

                // If no approval needed:
                $purchaseOrder->update(['status' => 'purchase_order']);
            }

            // Original Workflow Engine logic (commented out or kept as secondary?)
            // If we are replacing logic, we should probably remove the old one or ensure they don't conflict.
            // The old logic:
            /*
            $workflow = Workflow::where('module', 'purchasing')
                ->where('entity_type', 'App\\Models\\PurchaseOrder')
                ->where('is_active', true)
                ->first();

            if ($workflow) {
                // ...
            }
            */
        });
    }
}
