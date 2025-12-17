<?php

namespace Tests\Feature\Purchasing;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Uom;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Workflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public $user;

    protected $workflowEngine;

    protected function setUp(): void
    {
        parent::setUp();

        \Illuminate\Support\Facades\Notification::fake();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        $this->workflowEngine = app(WorkflowEngine::class);
    }

    public function test_purchase_order_status_updates_on_workflow_completion()
    {
        // 1. Create Workflow
        $workflow = Workflow::create([
            'name' => 'PO Approval',
            'entity_type' => PurchaseOrder::class,
            'description' => 'Test',
            'is_active' => true,
            'module' => 'purchasing',
            'created_by' => $this->user->id,
        ]);

        $step = $workflow->steps()->create([
            'name' => 'Manager Approval',
            'step_number' => 1,
            'config' => [
                'approvers' => [
                    'type' => 'user',
                    'user_ids' => [$this->user->id],
                ],
            ],
        ]);

        // 2. Create PO
        $warehouse = Warehouse::factory()->create();
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $uom = Uom::factory()->create();
        $product = Product::factory()->create(['uom_id' => $uom->id]);

        $po = PurchaseOrder::create([
            'document_number' => 'PO-WF-001',
            'vendor_id' => $vendor->id,
            'warehouse_id' => $warehouse->id,
            'date' => now(),
            'status' => 'draft',
            'total' => 100,
        ]);
        $po->items()->create([
            'product_id' => $product->id,
            'quantity' => 10,
            'unit_price' => 10,
            'subtotal' => 100,
            'uom_id' => $product->uom_id,
        ]);

        // 3. Submit PO (Starts Workflow) and manually trigger workflow logic if service not used,
        // but here we want to test interaction. Let's use SubmitService or manually start.
        // Let's mimic SubmitPurchaseOrderService logic
        $po->status = 'rfq_sent';
        $po->save();
        $instance = $this->workflowEngine->startWorkflow($workflow, $po, $this->user->id);

        // Assert initial state
        $this->assertEquals('pending', $instance->status);
        $this->assertEquals('rfq_sent', $po->status);

        // 4. Approve Task
        $task = $instance->approvalTasks()->first();
        $approvalService = app(\App\Domain\Workflow\Services\ApprovalService::class);
        $approvalService->approve($task, $this->user->id, 'Approved');

        // 5. Verify PO Status
        $po->refresh();
        $instance->refresh();

        $this->assertEquals('approved', $instance->status);
        $this->assertEquals('purchase_order', $po->status); // This is the key assertion
    }
}
