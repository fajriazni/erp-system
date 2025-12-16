<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Warehouse;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($role);

    $this->vendor = Contact::factory()->create(['type' => 'vendor']);
    $this->warehouse = Warehouse::factory()->create();
    $this->product = Product::factory()->create();
});

test('purchasing index page is displayed', function () {
    $this->actingAs($this->user)
        ->get('/purchasing/orders')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Purchasing/orders/index')
        );
});

test('can create a new purchase order', function () {
    $data = [
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'date' => now()->toDateString(),
        'notes' => 'Test Order',
        'items' => [
            [
                'product_id' => $this->product->id,
                'quantity' => 10,
                'unit_price' => 100,
            ],
        ],
    ];

    $this->actingAs($this->user)
        ->post('/purchasing/orders', $data)
        ->assertRedirect('/purchasing/orders');

    $this->assertDatabaseHas('purchase_orders', [
        'vendor_id' => $this->vendor->id,
        'status' => 'draft',
        'total' => 1000, // 10 * 100
    ]);

    $this->assertDatabaseHas('purchase_order_items', [
        'product_id' => $this->product->id,
        'quantity' => 10,
        'unit_price' => 100,
        'subtotal' => 1000,
    ]);
});

test('can update a draft purchase order', function () {
    $po = PurchaseOrder::create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'document_number' => 'TEST-001',
        'date' => now(),
        'status' => 'draft',
    ]);

    // Create initial item
    $po->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 5,
        'unit_price' => 10,
        'subtotal' => 50,
    ]);

    $data = [
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'date' => now()->toDateString(),
        'notes' => 'Updated Notes',
        'items' => [
            [
                'product_id' => $this->product->id,
                'quantity' => 20, // Changed qty
                'unit_price' => 100, // Changed price
            ],
        ],
    ];

    $this->actingAs($this->user)
        ->put("/purchasing/orders/{$po->id}", $data)
        ->assertRedirect('/purchasing/orders');

    $this->assertDatabaseHas('purchase_orders', [
        'id' => $po->id,
        'total' => 2000,
        'notes' => 'Updated Notes',
    ]);
});

test('cannot delete a non-draft purchase order', function () {
    $po = PurchaseOrder::create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'document_number' => 'TEST-LOCKED',
        'date' => now(),
        'status' => 'purchase_order', // Locked status
    ]);

    $this->actingAs($this->user)
        ->delete("/purchasing/orders/{$po->id}")
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('purchase_orders', ['id' => $po->id]);
});
