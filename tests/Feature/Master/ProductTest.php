<?php

use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($role);
});

test('products index page is displayed', function () {
    $this->actingAs($this->user)
        ->get('/master/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/products/index')
        );
});

test('can create a new product', function () {
    $productData = [
        'name' => 'Test Product',
        'code' => 'TP-001',
        'type' => 'goods',
        'price' => 100000,
        'cost' => 80000,
        'stock_control' => true,
        'notes' => 'Test notes',
    ];

    $this->actingAs($this->user)
        ->post('/master/products', $productData)
        ->assertRedirect('/master/products');

    $this->assertDatabaseHas('products', [
        'code' => 'TP-001',
        'name' => 'Test Product',
    ]);
});

test('can update a product', function () {
    $product = Product::factory()->create();

    $this->actingAs($this->user)
        ->put("/master/products/{$product->id}", [
            'name' => 'Updated Product',
            'code' => $product->code,
            'type' => 'goods',
            'price' => 150000,
            'cost' => 90000,
            'stock_control' => false,
            'notes' => 'Updated notes',
        ])
        ->assertRedirect('/master/products');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Product',
        'price' => 150000,
    ]);
});

test('can delete a product', function () {
    $product = Product::factory()->create();

    $this->actingAs($this->user)
        ->delete("/master/products/{$product->id}")
        ->assertRedirect('/master/products');

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('product validation fails for required fields', function () {
    $this->actingAs($this->user)
        ->post('/master/products', [])
        ->assertSessionHasErrors(['name', 'code', 'type', 'price', 'cost']);
});

test('product code must be unique', function () {
    $product = Product::factory()->create(['code' => 'DUPLICATE']);

    $this->actingAs($this->user)
        ->post('/master/products', [
            'name' => 'Another Product',
            'code' => 'DUPLICATE',
            'type' => 'goods',
            'price' => 100,
            'cost' => 50,
        ])
        ->assertSessionHasErrors(['code']);
});
