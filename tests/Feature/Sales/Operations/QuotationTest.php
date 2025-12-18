<?php

use App\Models\SalesOrder;
use App\Models\User;
use App\Models\Contact;
use App\Models\Warehouse;
use App\Models\Product;

test('quotations screen can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('sales.quotations.index'));

    $response->assertStatus(200);
});

test('can create a quotation', function () {
    $user = User::factory()->create();
    $customer = Contact::factory()->create(['is_customer' => true]);
    $warehouse = Warehouse::factory()->create();
    $product = Product::factory()->create(['is_sold' => true, 'price' => 1000]);

    $response = $this->actingAs($user)->post(route('sales.quotations.store'), [
        'customer_id' => $customer->id,
        'warehouse_id' => $warehouse->id,
        'date' => now()->toDateString(),
        'lines' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 1000,
            ]
        ]
    ]);

    $response->assertRedirect(route('sales.quotations.index'));

    $this->assertDatabaseHas('sales_orders', [
        'customer_id' => $customer->id,
        'status' => 'draft',
        'total' => 2000,
    ]);
});
