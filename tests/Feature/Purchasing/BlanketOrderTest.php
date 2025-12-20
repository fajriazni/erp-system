<?php

namespace Tests\Feature\Purchasing;

use App\Models\User;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseAgreement;
use App\Models\BlanketOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class BlanketOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_blanket_orders_index()
    {
        $user = User::factory()->create();
        BlanketOrder::factory()->count(3)->create();

        $response = $this->actingAs($user)->get(route('purchasing.blanket-orders.index'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Purchasing/BlanketOrders/Index')
                ->has('blanket_orders.data', 3)
            );
    }

    public function test_can_view_create_blanket_order_page()
    {
        $user = User::factory()->create();
        Contact::factory()->count(3)->create(['type' => 'vendor']);

        $response = $this->actingAs($user)->get(route('purchasing.blanket-orders.create'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Purchasing/BlanketOrders/Create')
                ->has('vendors', 3)
            );
    }

    public function test_can_create_blanket_order()
    {
        $user = User::factory()->create();
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $product = Product::factory()->create(['price' => 100]);

        $response = $this->actingAs($user)->post(route('purchasing.blanket-orders.store'), [
            'vendor_id' => $vendor->id,
            'number' => 'BPO-2025-001',
            'start_date' => '2025-01-01',
            'amount_limit' => 50000,
            'status' => 'active',
            'lines' => [
                [
                    'product_id' => $product->id,
                    'unit_price' => 90,
                    'quantity_agreed' => 100,
                ]
            ]
        ]);

        $response->assertRedirect(route('purchasing.blanket-orders.index'));
        
        $this->assertDatabaseHas('blanket_orders', [
            'number' => 'BPO-2025-001',
            'amount_limit' => 50000,
            'vendor_id' => $vendor->id,
        ]);

        $this->assertDatabaseHas('blanket_order_lines', [
            'product_id' => $product->id,
            'unit_price' => 90,
        ]);
    }

    public function test_can_view_blanket_order_details()
    {
        $user = User::factory()->create();
        $bpo = BlanketOrder::factory()->create();

        $response = $this->actingAs($user)->get(route('purchasing.blanket-orders.show', $bpo));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Purchasing/BlanketOrders/Show')
                ->where('blanket_order.id', $bpo->id)
            );
    }

    public function test_can_update_blanket_order()
    {
        $user = User::factory()->create();
        $bpo = BlanketOrder::factory()->create();
        
        $response = $this->actingAs($user)->put(route('purchasing.blanket-orders.update', $bpo), [
            'vendor_id' => $bpo->vendor_id,
            'number' => $bpo->number,
            'start_date' => $bpo->start_date,
            'amount_limit' => 60000, // Updated
            'status' => $bpo->status,
            'lines' => [],
        ]);

        $response->assertRedirect(route('purchasing.blanket-orders.index'));
        
        $this->assertDatabaseHas('blanket_orders', [
            'id' => $bpo->id,
            'amount_limit' => 60000,
        ]);
    }

    public function test_can_delete_blanket_order()
    {
        $user = User::factory()->create();
        $bpo = BlanketOrder::factory()->create();

        $response = $this->actingAs($user)->delete(route('purchasing.blanket-orders.destroy', $bpo));

        $response->assertRedirect(route('purchasing.blanket-orders.index'));
        
        $this->assertDatabaseMissing('blanket_orders', [
            'id' => $bpo->id,
        ]);
    }
}
