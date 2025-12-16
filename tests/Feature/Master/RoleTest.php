<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($role);

    // Create some permissions to test assignment
    Permission::firstOrCreate(['name' => 'users.index']);
    Permission::firstOrCreate(['name' => 'users.create']);
});

test('roles index page is displayed', function () {
    $this->actingAs($this->user)
        ->get('/master/roles')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/roles/index')
        );
});

test('can create a new role with permissions', function () {
    $data = [
        'name' => 'Test Manager',
        'permissions' => ['users.index', 'users.create'],
    ];

    $this->actingAs($this->user)
        ->post('/master/roles', $data)
        ->assertRedirect('/master/roles');

    $this->assertDatabaseHas('roles', ['name' => 'Test Manager']);

    $role = Role::where('name', 'Test Manager')->first();
    expect($role->hasPermissionTo('users.index'))->toBeTrue();
    expect($role->hasPermissionTo('users.create'))->toBeTrue();
});

test('can update a role and permissions', function () {
    $role = Role::create(['name' => 'Test Staff', 'guard_name' => 'web']);
    $role->givePermissionTo('users.index');

    $this->actingAs($this->user)
        ->put("/master/roles/{$role->id}", [
            'name' => 'Updated Staff',
            'permissions' => ['users.create'], // Replace permissions
        ])
        ->assertRedirect('/master/roles');

    $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'Updated Staff']);

    $role->refresh();
    expect($role->hasPermissionTo('users.index'))->toBeFalse();
    expect($role->hasPermissionTo('users.create'))->toBeTrue();
});

test('cannot delete super admin role', function () {
    $role = Role::where('name', 'Super Admin')->first();

    $this->actingAs($this->user)
        ->delete("/master/roles/{$role->id}")
        ->assertRedirect('/master/roles') // Assuming validation redirects back or to index
        ->assertSessionHas('error'); // Flash error message expected

    $this->assertDatabaseHas('roles', ['name' => 'Super Admin']);
});

test('role validation fails for required fields', function () {
    $this->actingAs($this->user)
        ->post('/master/roles', [])
        ->assertSessionHasErrors(['name']);
});

test('role name must be unique', function () {
    Role::create(['name' => 'Existing Role', 'guard_name' => 'web']);

    $this->actingAs($this->user)
        ->post('/master/roles', ['name' => 'Existing Role'])
        ->assertSessionHasErrors(['name']);
});

test('can delete a normal role', function () {
    $role = Role::create(['name' => 'Temporary Role', 'guard_name' => 'web']);

    $this->actingAs($this->user)
        ->delete("/master/roles/{$role->id}")
        ->assertRedirect('/master/roles'); // Should be index now if consistent, or back

    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});
