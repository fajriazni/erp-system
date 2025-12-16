<?php

use App\Models\Uom;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($role);
});

test('uoms index page is displayed', function () {
    $this->actingAs($this->user)
        ->get('/master/uoms')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('master/uoms/index')
        );
});

test('can create a new uom', function () {
    $data = [
        'name' => 'Kilogram',
        'symbol' => 'kg',
    ];

    $this->actingAs($this->user)
        ->post('/master/uoms', $data)
        ->assertRedirect('/master/uoms');

    $this->assertDatabaseHas('uoms', $data);
});

test('can update a uom', function () {
    $uom = Uom::factory()->create();

    $this->actingAs($this->user)
        ->put("/master/uoms/{$uom->id}", [
            'name' => 'Gram',
            'symbol' => 'g',
        ])
        ->assertRedirect('/master/uoms');

    $this->assertDatabaseHas('uoms', [
        'id' => $uom->id,
        'name' => 'Gram',
        'symbol' => 'g',
    ]);
});

test('can delete a uom', function () {
    $uom = Uom::factory()->create();

    $this->actingAs($this->user)
        ->delete("/master/uoms/{$uom->id}")
        ->assertRedirect('/master/uoms');

    $this->assertDatabaseMissing('uoms', ['id' => $uom->id]);
});
