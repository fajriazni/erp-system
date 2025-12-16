<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->user = User::factory()->create();
    $this->user->assignRole('Super Admin');
});

test('can filter users by role', function () {
    // Create a manager
    $manager = User::factory()->create(['name' => 'Manager User']);
    $manager->assignRole('Manager');

    // Create a staff
    $staff = User::factory()->create(['name' => 'Staff User']);
    $staff->assignRole('Staff');

    $this->actingAs($this->user)
        ->get('/master/users?filter[role]=Manager')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.id', $manager->id)
        );

    $this->actingAs($this->user)
        ->get('/master/users?filter[role]=Staff')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.id', $staff->id)
        );
});
