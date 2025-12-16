<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseRequest;
use App\Models\Uom;
use App\Models\User;
use App\Models\Workflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_can_create_purchase_request()
    {
        $uom = Uom::factory()->create(['name' => 'Unit']);
        $product = Product::factory()->create(['uom_id' => $uom->id]);

        $response = $this->post(route('purchasing.requests.store'), [
            'date' => now()->toDateString(),
            'required_date' => now()->addDays(7)->toDateString(),
            'notes' => 'Test PR',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'estimated_unit_price' => 100,
                ]
            ]
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('purchase_requests', [
            'status' => 'draft',
            'notes' => 'Test PR',
        ]);
        $this->assertDatabaseHas('purchase_request_items', [
            'product_id' => $product->id,
            'quantity' => 10,
            'estimated_total' => 1000,
        ]);
    }

    public function test_can_submit_purchase_request()
    {
        // Seed Workflow
        Workflow::create([
             'name' => 'PR Workflow',
             'module' => 'purchasing',
             'entity_type' => PurchaseRequest::class,
             'is_active' => true,
             'definition' => json_encode(['steps' => []]), // Minimal dummy definition
             'created_by' => $this->user->id,
        ]);

        $request = PurchaseRequest::factory()->create([
             'status' => 'draft',
             'requester_id' => $this->user->id
        ]);

        $response = $this->post(route('purchasing.requests.submit', $request->id));

        $response->assertRedirect();
        $request->refresh();
        $this->assertEquals('submitted', $request->status);
    }

    public function test_can_convert_approved_pr_to_po()
    {
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $warehouse = \App\Models\Warehouse::factory()->create();
        $uom = Uom::factory()->create(['name' => 'Unit']);
        $product = Product::factory()->create(['uom_id' => $uom->id]);

        $request = PurchaseRequest::factory()->create([
            'status' => 'approved',
            'requester_id' => $this->user->id
        ]);
        
        $request->items()->create([
            'product_id' => $product->id,
            'quantity' => 5,
            'uom_id' => $product->uom_id,
            'estimated_unit_price' => 50,
            'estimated_total' => 250,
        ]);

        $response = $this->post(route('purchasing.requests.convert', $request->id), [
            'vendor_id' => $vendor->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $request->refresh();
        $this->assertEquals('converted', $request->status);

        $this->assertDatabaseHas('purchase_orders', [
            'purchase_request_id' => $request->id,
            'vendor_id' => $vendor->id,
            'status' => 'draft',
        ]);
    }
}
