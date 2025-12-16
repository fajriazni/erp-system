<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\PurchaseRequest;
use Exception;

class SubmitPurchaseRequestService
{
    public function __construct(
        protected WorkflowEngine $workflowEngine
    ) {}

    public function execute(PurchaseRequest $request): void
    {
        if ($request->status !== 'draft') {
            throw new Exception("Only draft requests can be submitted.");
        }

        $workflow = \App\Models\Workflow::where('module', 'purchasing')
            ->where('entity_type', get_class($request))
            ->where('is_active', true)
            ->first();

        if ($workflow) {
            $this->workflowEngine->startWorkflow($workflow, $request, $request->requester_id ?? auth()->id());
            $request->markAsPendingApproval();
        } else {
            // If no workflow, maybe auto-approve? Or just leave as submitted?
            // tailored for "Enterprise", usually requires at least one approval.
            // But for now, let's just mark it submitted.
             $request->markAsPendingApproval();
             // Optional: $request->approve(); if we want auto-approval without workflow
        }
    }
}
