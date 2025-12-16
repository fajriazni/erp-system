<?php

use App\Models\Category;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($role);
});

test('categories index page is displayed', function () {
    $this->actingAs($this->user)
        ->get('/master/categories')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/categories/index')
        );
});

test('can create a new category', function () {
    $data = [
        'name' => 'Electronics',
        'type' => 'product',
    ];

    $this->actingAs($this->user)
        ->post('/master/categories', $data)
        ->assertRedirect('/master/categories');

    $this->assertDatabaseHas('categories', $data);
});

test('can update a category', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->user)
        ->put("/master/categories/{$category->id}", [
            'name' => 'Updated Category',
            'type' => 'contact',
        ])
        ->assertRedirect('/master/categories');

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Updated Category',
        'type' => 'contact',
    ]);
});

test('can delete a category', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->user)
        ->delete("/master/categories/{$category->id}")
        ->assertRedirect('/master/categories');

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});
