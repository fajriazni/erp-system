<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRfq;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrToRfqFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_rfq_from_approved_pr()
    {
        $user = User::factory()->create(['email' => 'buyer@example.com']);
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $uom = \App\Models\Uom::factory()->create();
        $product = Product::factory()->create(['uom_id' => $uom->id]);
        
        // 1. Create and Approve PR
        $pr = PurchaseRequest::factory()->create([
            'status' => 'approved',
            'requester_id' => $user->id,
        ]);
        
        $item = $pr->items()->create([
            'product_id' => $product->id,
            'quantity' => 10,
            'uom_id' => $uom->id,
            'estimated_unit_price' => 100,
            'estimated_total' => 1000,
        ]);

        $this->actingAs($user);

        // 2. Visit Create RFQ Page with PR ID
        $response = $this->get(route('purchasing.rfqs.create', ['pr_id' => $pr->id]));
        $response->assertStatus(200);
        // Assert initial data is populated (Inertia prop check)
        $response->assertInertia(fn ($page) => $page
            ->component('Purchasing/rfqs/create')
            ->has('initialData', fn ($data) => $data
                ->where('items.0.product_id', (string) $product->id)
                ->where('items.0.quantity', 10)
                ->etc()
            )
        );

        // 3. Store RFQ
        $rfqData = [
            'purchase_request_id' => $pr->id,
            'title' => 'RFQ for PR #' . $pr->document_number,
            'deadline' => now()->addDays(7)->format('Y-m-d'),
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'uom_id' => $product->uom_id,
                    'target_price' => 95,
                ]
            ],
            'notes' => 'Test RFQ'
        ];

        $response = $this->post(route('purchasing.rfqs.store'), $rfqData);

        $response->assertRedirect(route('purchasing.rfqs.index'));
        $this->assertDatabaseHas('purchase_rfqs', [
            'purchase_request_id' => $pr->id,
            'title' => 'RFQ for PR #' . $pr->document_number,
        ]);
    }

    public function test_rfq_creation_requires_pr_id()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $rfqData = [
            'title' => 'Standalone RFQ', // No PR ID
            'deadline' => now()->addDays(7)->format('Y-m-d'),
            'items' => [],
        ];

        $response = $this->post(route('purchasing.rfqs.store'), $rfqData);

        $response->assertSessionHasErrors('purchase_request_id');
    }
}
