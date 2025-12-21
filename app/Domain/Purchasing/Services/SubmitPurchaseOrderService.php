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
        $purchaseOrder = PurchaseOrder::with('items', 'vendor', 'blanketOrder')->findOrFail($purchaseOrderId);

        // Validate the purchase order can be submitted
        if ($purchaseOrder->status !== 'draft') {
            throw new \InvalidArgumentException('Only draft purchase orders can be submitted');
        }

        // Check for Blanket Order Auto-Approval (Release Order)
        if ($purchaseOrder->blanket_order_id && $purchaseOrder->blanketOrder?->status === \App\Models\BlanketOrder::STATUS_OPEN) {
             // Auto-approve Release Orders against Active BPOs
             // 1. Mark as submitted (RFQs sent/Internal request made)
             $purchaseOrder->submit(); 
             
             // 2. Auto Approve
             $purchaseOrder->approve();
             return;
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
