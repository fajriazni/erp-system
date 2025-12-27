<?php

use App\Models\AccountingPeriod;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(AccountingSeeder::class);
    $this->user = User::factory()->create();
});

test('periods index page returns success', function () {
    $response = $this->actingAs($this->user)->get('/accounting/periods');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Accounting/Closing/Periods')
            ->has('periods')
            ->has('filters')
            ->has('availableYears')
        );
});

test('can create new accounting period', function () {
    $data = [
        'name' => '2025-01',
        'start_date' => '2025-01-01',
        'end_date' => '2025-01-31',
    ];

    $response = $this->actingAs($this->user)
        ->post('/accounting/periods', $data);

    $response->assertRedirect(route('accounting.periods.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('accounting_periods', [
        'name' => '2025-01',
        'status' => 'open',
    ]);
});

test('can lock an accounting period', function () {
    $period = AccountingPeriod::create([
        'name' => '2024-12',
        'start_date' => '2024-12-01',
        'end_date' => '2024-12-31',
        'status' => 'open',
    ]);

    $response = $this->actingAs($this->user)
        ->post("/accounting/periods/{$period->id}/lock", [
            'notes' => 'Year end closing',
        ]);

    $response->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('accounting_periods', [
        'id' => $period->id,
        'status' => 'locked',
        'locked_by' => $this->user->id,
    ]);
});

test('can unlock an accounting period', function () {
    $period = AccountingPeriod::create([
        'name' => '2024-11',
        'start_date' => '2024-11-01',
        'end_date' => '2024-11-30',
        'status' => 'locked',
        'locked_by' => $this->user->id,
        'locked_at' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->post("/accounting/periods/{$period->id}/unlock");

    $response->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('accounting_periods', [
        'id' => $period->id,
        'status' => 'open',
    ]);
});

test('cannot lock already locked period', function () {
    $period = AccountingPeriod::create([
        'name' => '2024-10',
        'start_date' => '2024-10-01',
        'end_date' => '2024-10-31',
        'status' => 'locked',
        'locked_by' => $this->user->id,
        'locked_at' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->post("/accounting/periods/{$period->id}/lock");

    $response->assertRedirect()
        ->assertSessionHasErrors();
});

test('filters periods by status', function () {
    AccountingPeriod::create([
        'name' => 'Open Period',
        'start_date' => '2025-01-01',
        'end_date' => '2025-01-31',
        'status' => 'open',
    ]);

    AccountingPeriod::create([
        'name' => 'Locked Period',
        'start_date' => '2024-12-01',
        'end_date' => '2024-12-31',
        'status' => 'locked',
        'locked_by' => $this->user->id,
        'locked_at' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get('/accounting/periods?status=locked');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Accounting/Closing/Periods')
            ->where('filters.status', 'locked')
        );
});
