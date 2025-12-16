<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->admin = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->admin->assignRole($role);

    // Create another role for testing assignment
    Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
});

test('users index page is displayed', function () {
    $this->actingAs($this->admin)
        ->get('/master/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/users/index')
        );
});

test('can create a new user with roles', function () {
    $data = [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'roles' => ['Staff'],
    ];

    $this->actingAs($this->admin)
        ->post('/master/users', $data)
        ->assertRedirect('/master/users');

    $this->assertDatabaseHas('users', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
    ]);

    $user = User::where('email', 'newuser@example.com')->first();
    expect($user->hasRole('Staff'))->toBeTrue();
});

test('can update a user', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    $this->actingAs($this->admin)
        ->put("/master/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => $user->email,
            'roles' => ['Super Admin'],
        ])
        ->assertRedirect('/master/users');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Name',
    ]);

    $user->refresh();
    expect($user->hasRole('Super Admin'))->toBeTrue();
});

test('can delete a user', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/master/users/{$user->id}")
        ->assertRedirect('/master/users');

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('user validation fails for required fields', function () {
    $this->actingAs($this->admin)
        ->post('/master/users', [])
        ->assertSessionHasErrors(['name', 'email', 'password', 'roles']);
});

test('user email must be unique', function () {
    User::factory()->create(['email' => 'duplicate@example.com']);

    $this->actingAs($this->admin)
        ->post('/master/users', [
            'name' => 'Another User',
            'email' => 'duplicate@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => ['Staff'],
        ])
        ->assertSessionHasErrors(['email']);
});

test('user password confirmation', function () {
    $this->actingAs($this->admin)
        ->post('/master/users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'mismatch',
            'roles' => ['Staff'],
        ])
        ->assertSessionHasErrors(['password']);
});
