<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseOrder;
use App\Models\Workflow;
use App\Domain\Workflow\Services\WorkflowEngine;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubmitPurchaseOrderService
{
    public function __construct(
        private WorkflowEngine $workflowEngine
    ) {}

    public function execute(int $purchaseOrderId): void
    {
        DB::transaction(function () use ($purchaseOrderId) {
            $purchaseOrder = PurchaseOrder::with('items', 'vendor')->findOrFail($purchaseOrderId);

            // Domain logic handles validation and state transition
            $purchaseOrder->submit();

            // Start workflow approval process
            $workflow = Workflow::where('module', 'purchasing')
                ->where('entity_type', 'App\\Models\\PurchaseOrder')
                ->where('is_active', true)
                ->first();

            if ($workflow) {
                $this->workflowEngine->startWorkflow(
                    $workflow,
                    $purchaseOrder,
                    Auth::id() ?? 1
                );
                
                // Update status to indicate it is under approval using domain method
                $purchaseOrder->markAsPendingApproval();
            }
        });
    }
}
