<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\PurchaseAgreement;
use App\Models\Workflow;

class SubmitContractService
{
    public function __construct(
        private WorkflowEngine $workflowEngine
    ) {}

    public function execute(int $contractId): void
    {
        $contract = PurchaseAgreement::findOrFail($contractId);

        // Validate state
        if ($contract->status !== PurchaseAgreement::STATUS_DRAFT) {
            throw new \InvalidArgumentException('Only draft agreements can be submitted.');
        }

        // Find active workflow for Purchase Agreements
        $workflow = Workflow::where('module', 'purchasing')
            ->where('entity_type', PurchaseAgreement::class)
            ->where('is_active', true)
            ->first();

        if ($workflow) {
            // Update status to indicate pending approval
            $contract->submit(); // This sets status to 'pending_approval' and fires event

            // Start the workflow
            $this->workflowEngine->startWorkflow($workflow, $contract, auth()->id() ?? 1);
        } else {
            // No workflow configured, auto-approve
            $contract->update(['status' => PurchaseAgreement::STATUS_ACTIVE]);
            event(new \App\Domain\Purchasing\Events\PurchaseAgreementApproved($contract));
        }
    }
}
