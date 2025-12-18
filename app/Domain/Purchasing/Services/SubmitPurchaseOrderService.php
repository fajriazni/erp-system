<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\PurchaseOrder;

class SubmitPurchaseOrderService
{
    public function __construct(
        private WorkflowEngine $workflowEngine,
        private \App\Domain\Workflow\Services\WorkflowInstanceService $workflowService
    ) {}

    public function execute(int $purchaseOrderId): void
    {
        $purchaseOrder = PurchaseOrder::with('items', 'vendor')->findOrFail($purchaseOrderId);

        // Validate the purchase order can be submitted
        if ($purchaseOrder->status !== 'draft') {
            throw new \InvalidArgumentException('Only draft purchase orders can be submitted');
        }

        // Initiate Workflow
        $workflow = $this->workflowService->findWorkflowForEntity('purchasing', get_class($purchaseOrder));

        if ($workflow) {
            // Set status to 'to_approve' for approval workflow
            $purchaseOrder->update(['status' => 'to_approve']);

            // Start the workflow (already wrapped in transaction internally)
            $this->workflowEngine->startWorkflow($workflow, $purchaseOrder, auth()->id() ?? 1);
        } else {
            // No workflow configured, auto-approve
            $purchaseOrder->update(['status' => 'purchase_order']);
        }
    }
}
