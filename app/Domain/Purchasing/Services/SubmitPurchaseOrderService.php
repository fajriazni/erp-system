<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\PurchaseOrder;
use App\Models\Workflow;

class SubmitPurchaseOrderService
{
    public function __construct(
        private WorkflowEngine $workflowEngine
    ) {}

    public function execute(int $purchaseOrderId): void
    {
        $purchaseOrder = PurchaseOrder::with('items', 'vendor')->findOrFail($purchaseOrderId);

        // Validate the purchase order can be submitted
        if ($purchaseOrder->status !== 'draft') {
            throw new \InvalidArgumentException('Only draft purchase orders can be submitted');
        }

        // Find active workflow for Purchase Orders
        $workflow = Workflow::where('module', 'purchasing')
            ->where('entity_type', PurchaseOrder::class)
            ->where('is_active', true)
            ->first();

        if ($workflow) {
            // Set status to 'to_approve' for approval workflow
            $purchaseOrder->update(['status' => 'to_approve']);

            // Start the workflow
            // ConditionEvaluator will determine which steps execute based on PO total
            $this->workflowEngine->startWorkflow($workflow, $purchaseOrder, auth()->id() ?? 1);
        } else {
            // No workflow configured, auto-approve
            $purchaseOrder->update(['status' => 'open']);
        }
    }
}
