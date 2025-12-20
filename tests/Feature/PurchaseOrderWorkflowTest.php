<?php

namespace Tests\Feature;

use App\Domain\Purchasing\Services\SubmitPurchaseOrderService;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Workflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PurchaseOrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public $user;
    public $vendor;
    public $warehouse;
    public $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup test data
        $this->user = User::factory()->create();
        $this->vendor = Contact::factory()->create(['type' => 'vendor']);
        $this->warehouse = Warehouse::factory()->create();
        $this->product = Product::factory()->create();

        // Setup roles for workflow
        Role::create(['name' => 'Purchasing Supervisor', 'guard_name' => 'web']);
        Role::create(['name' => 'Purchasing Manager', 'guard_name' => 'web']);
        Role::create(['name' => 'Finance Manager', 'guard_name' => 'web']);
        Role::create(['name' => 'CEO', 'guard_name' => 'web']);

        // Seed the conditional workflow
        $this->artisan('db:seed', ['--class' => 'ConditionalPurchaseOrderWorkflowSeeder']);
    }

    /** @test */
    public function it_creates_supervisor_only_approval_for_small_po()
    {
        // Create PO with total < 10M
        $po = $this->createPurchaseOrder(5_000_000);

        // Submit for approval
        $service = app(SubmitPurchaseOrderService::class);
        $this->actingAs($this->user);
        $service->execute($po->id);

        // Assertions
        $po->refresh();
        $this->assertEquals('to_approve', $po->status);

        // Should have workflow instance
        $this->assertDatabaseHas('workflow_instances', [
            'entity_type' => PurchaseOrder::class,
            'entity_id' => $po->id,
            'status' => 'active',
        ]);

        // Should have only 1 approval task (Supervisor)
        $tasks = $po->workflowInstances()->first()->approvalTasks()->where('status', 'pending')->get();
        $this->assertCount(1, $tasks);
        $this->assertEquals('Supervisor Approval', $tasks->first()->workflowStep->name);
    }

    /** @test */
    public function it_creates_two_level_approval_for_medium_po()
    {
        // Create PO with total 25M (10M - 50M range)
        $po = $this->createPurchaseOrder(25_000_000);

        // Submit for approval
        $service = app(SubmitPurchaseOrderService::class);
        $this->actingAs($this->user);
        $service->execute($po->id);

        $po->refresh();
        
        // Should have 2 steps that will execute
        $workflow = Workflow::where('entity_type', PurchaseOrder::class)->first();
        $activeSteps = $workflow->steps->filter(function ($step) use ($po) {
            // No conditions or conditions met
            if ($step->conditions->isEmpty()) {
                return true;
            }
            
            $condition = $step->conditions->first();
            if ($condition->operator === '>=' && $condition->field_path === 'total') {
                return $po->total >= $condition->value[0];
            }
            
            return false;
        });

        $this->assertCount(2, $activeSteps); // Supervisor + Manager
    }

    /** @test */
    public function it_creates_three_level_approval_for_large_po()
    {
        // Create PO with total 75M (50M - 100M range)
        $po = $this->createPurchaseOrder(75_000_000);

        $service = app(SubmitPurchaseOrderService::class);
        $this->actingAs($this->user);
        $service->execute($po->id);

        $po->refresh();
        
        $workflow = Workflow::where('entity_type', PurchaseOrder::class)->first();
        $activeSteps = $workflow->steps->filter(function ($step) use ($po) {
            if ($step->conditions->isEmpty()) {
                return true;
            }
            
            $condition = $step->conditions->first();
            if ($condition->operator === '>=' && $condition->field_path === 'total') {
                return $po->total >= $condition->value[0];
            }
            
            return false;
        });

        $this->assertCount(3, $activeSteps); // Supervisor + Manager + Finance
    }

    /** @test */
    public function it_creates_four_level_approval_for_very_large_po()
    {
        // Create PO with total 150M (> 100M)
        $po = $this->createPurchaseOrder(150_000_000);

        $service = app(SubmitPurchaseOrderService::class);
        $this->actingAs($this->user);
        $service->execute($po->id);

        $po->refresh();
        
        $workflow = Workflow::where('entity_type', PurchaseOrder::class)->first();
        $activeSteps = $workflow->steps->filter(function ($step) use ($po) {
            if ($step->conditions->isEmpty()) {
                return true;
            }
            
            $condition = $step->conditions->first();
            if ($condition->operator === '>=' && $condition->field_path === 'total') {
                return $po->total >= $condition->value[0];
            }
            
            return false;
        });

        $this->assertCount(4, $activeSteps); // All 4 levels
    }

    /** @test */
    public function it_throws_exception_when_submitting_non_draft_po()
    {
        $po = $this->createPurchaseOrder(5_000_000);
        $po->update(['status' => 'open']);

        $service = app(SubmitPurchaseOrderService::class);
        $this->actingAs($this->user);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Only draft purchase orders can be submitted');

        $service->execute($po->id);
    }

    /** @test */
    public function it_auto_approves_when_no_workflow_exists()
    {
        // Delete all workflows
        Workflow::where('entity_type', PurchaseOrder::class)->delete();

        $po = $this->createPurchaseOrder(5_000_000);

        $service = app(SubmitPurchaseOrderService::class);
        $this->actingAs($this->user);
        $service->execute($po->id);

        $po->refresh();
        $this->assertEquals('open', $po->status);
    }

    protected function createPurchaseOrder(float $total): PurchaseOrder
    {
        return PurchaseOrder::create([
            'document_number' => 'PO-TEST-' . rand(1000, 9999),
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'date' => now(),
            'status' => 'draft',
            'subtotal' => $total,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'withholding_tax_rate' => 0,
            'withholding_tax_amount' => 0,
            'tax_inclusive' => false,
            'total' => $total,
        ]);
    }
}
