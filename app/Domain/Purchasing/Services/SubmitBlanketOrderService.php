<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\BlanketOrder;
use App\Models\Workflow;

class SubmitBlanketOrderService
{
    public function __construct(
        private WorkflowEngine $workflowEngine
    ) {}

    public function execute(int $blanketOrderId): void
    {
        $blanketOrder = BlanketOrder::findOrFail($blanketOrderId);

        // Validate state
        if (! in_array($blanketOrder->status, [BlanketOrder::STATUS_DRAFT, BlanketOrder::STATUS_REJECTED])) {
            throw new \InvalidArgumentException('Only draft or rejected blanket orders can be submitted.');
        }

        // Find active workflow for Blanket Orders
        $workflow = Workflow::where('module', 'purchasing')
            ->where('entity_type', BlanketOrder::class)
            ->where('is_active', true)
            ->first();

        if ($workflow) {
            // Update status to indicate pending approval
            $blanketOrder->submit(); // This sets status to 'pending_approval'

            // Start the workflow
            $this->workflowEngine->startWorkflow($workflow, $blanketOrder, auth()->id() ?? 1);
        } else {
            // No workflow configured, auto-approve/activate
            // Using activate() method which sets it to OPEN
            // Wait, activate checks for draft/sent.
            $blanketOrder->activate();
            // TODO: dispatch event?
        }
    }
}
