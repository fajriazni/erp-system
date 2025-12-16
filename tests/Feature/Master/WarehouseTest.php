<?php

use App\Models\User;
use App\Models\Warehouse;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($role);
});

test('warehouses index page is displayed', function () {
    $this->actingAs($this->user)
        ->get('/master/warehouses')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/warehouses/index')
        );
});

test('can create a new warehouse', function () {
    $data = [
        'name' => 'Test Warehouse',
        'address' => 'Test Address',
    ];

    $this->actingAs($this->user)
        ->post('/master/warehouses', $data)
        ->assertRedirect('/master/warehouses');

    $this->assertDatabaseHas('warehouses', $data);
});

test('can update a warehouse', function () {
    $warehouse = Warehouse::factory()->create();

    $this->actingAs($this->user)
        ->put("/master/warehouses/{$warehouse->id}", [
            'name' => 'Updated Warehouse',
            'address' => 'Updated Address',
        ])
        ->assertRedirect('/master/warehouses');

    $this->assertDatabaseHas('warehouses', [
        'id' => $warehouse->id,
        'name' => 'Updated Warehouse',
        'address' => 'Updated Address',
    ]);
});

test('can delete a warehouse', function () {
    $warehouse = Warehouse::factory()->create();

    $this->actingAs($this->user)
        ->delete("/master/warehouses/{$warehouse->id}")
        ->assertRedirect('/master/warehouses');

    $this->assertDatabaseMissing('warehouses', ['id' => $warehouse->id]);
});
