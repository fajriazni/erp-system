<?php

namespace Tests\Feature\Purchasing;

use App\Domain\Purchasing\Services\ApprovePurchaseOrderService;
use App\Domain\Purchasing\Services\SubmitPurchaseOrderService;
use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatusTransitionTest extends TestCase
{
    use RefreshDatabase;

    public $user;
    public $vendor;
    public $warehouse;
    public $product;
    public $uom;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Notification::fake();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Create dependencies
        $this->vendor = \App\Models\Contact::create(['name' => 'Test Vendor', 'type' => 'vendor']);
        $this->warehouse = \App\Models\Warehouse::create(['name' => 'Main Warehouse', 'code' => 'WH01']);
        $this->uom = \App\Models\Uom::create(['name' => 'Unit', 'symbol' => 'unit']);
        $this->product = \App\Models\Product::create([
            'name' => 'Test Product',
            'code' => 'TP001',
            'type' => 'goods',
            'price' => 100,
            'cost' => 50,
            'uom_id' => $this->uom->id,
            'stock_control' => true,
        ]);
    }

    public function test_can_approve_po_in_rfq_sent_status()
    {
        // 1. Create a PO in rfq_sent status (simulating current stuck state)
        $po = PurchaseOrder::create([
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'document_number' => 'PO-STUCK-001',
            'date' => now(),
            'status' => 'rfq_sent', // The problematic status
            'total' => 100,
        ]);

        // 2. Attempt to approve
        $po->approve();

        // 3. Verify status changed to purchase_order
        $this->assertEquals('purchase_order', $po->fresh()->status);
    }

    public function test_submit_service_sets_status_to_to_approve()
    {
        // 1. Setup minimal workflow
        $workflow = Workflow::create([
            'name' => 'PO Workflow',
            'module' => 'purchasing',
            'entity_type' => PurchaseOrder::class,
            'is_active' => true,
            'created_by' => $this->user->id,
        ]);
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'name' => 'Approval',
            'step_number' => 1,
            'config' => ['approvers' => ['type' => 'user', 'user_ids' => [$this->user->id]]],
        ]);

        // 2. Create Draft PO
        $po = PurchaseOrder::create([
            'vendor_id' => 1,
            'warehouse_id' => 1,
            'document_number' => 'PO-NEW-001',
            'date' => now(),
            'status' => 'draft',
            'total' => 100,
        ]);
        // Add fake item so validation passes
        $po->items()->create([
            'quantity' => 1,
            'unit_price' => 100,
            'subtotal' => 100,
            'product_id' => $this->product->id,
            'uom_id' => $this->uom->id, // Use correct UoM ID
            'description' => 'Test Item'
        ]);


        // 3. Run Submit Service
        $service = app(SubmitPurchaseOrderService::class);
        $service->execute($po->id);

        // 4. Verify status is 'to_approve' (not 'rfq_sent')
        $this->assertEquals('to_approve', $po->fresh()->status);
    }
}
