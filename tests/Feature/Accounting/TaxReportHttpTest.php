<?php

use App\Models\TaxPeriod;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(AccountingSeeder::class);
    $this->user = User::factory()->create();
});

test('tax reports index page returns success', function () {
    $response = $this->actingAs($this->user)->get('/accounting/tax/periods');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Accounting/Tax/Report')
            ->has('periods')
            ->has('filters')
            ->has('availableYears')
        );
});

test('can generate tax report for a period', function () {
    $response = $this->actingAs($this->user)
        ->post('/accounting/tax/generate', [
            'period' => '2025-01',
        ]);

    $response->assertRedirect(route('accounting.tax.periods'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('tax_periods', [
        'period' => '2025-01',
        'status' => 'draft',
    ]);
});

test('can view tax report detail', function () {
    $taxPeriod = TaxPeriod::create([
        'period' => '2025-02',
        'start_date' => '2025-02-01',
        'end_date' => '2025-02-28',
        'input_tax' => 1000000,
        'output_tax' => 2000000,
        'net_tax' => -1000000,
        'status' => 'draft',
    ]);
    $response = $this->actingAs($this->user)
        ->get("/accounting/tax/periods/{$taxPeriod->period}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Accounting/Tax/Detail')
            ->has('taxPeriod')
        );
});

test('can export tax report to CSV', function () {
    $taxPeriod = TaxPeriod::create([
        'period' => '2025-03',
        'start_date' => '2025-03-01',
        'end_date' => '2025-03-31',
        'input_tax' => 500000,
        'output_tax' => 1000000,
        'net_tax' => -500000,
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->user)
        ->get("/accounting/tax/periods/{$taxPeriod->period}/export/csv");

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
});

test('tax period shows correct payable status', function () {
    TaxPeriod::create([
        'period' => '2025-04',
        'start_date' => '2025-04-01',
        'end_date' => '2025-04-30',
        'input_tax' => 1000000,
        'output_tax' => 3000000,
        'net_tax' => -2000000, // Negative = Payable
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->user)
        ->get('/accounting/tax/periods');

    $response->assertOk();

    $period = TaxPeriod::first();
    expect($period->is_payable)->toBeTrue();
});

test('tax period shows correct claimable status', function () {
    TaxPeriod::create([
        'period' => '2025-05',
        'start_date' => '2025-05-01',
        'end_date' => '2025-05-31',
        'input_tax' => 3000000,
        'output_tax' => 1000000,
        'net_tax' => 2000000, // Positive = Claimable
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->user)
        ->get('/accounting/tax/periods');

    $response->assertOk();

    $period = TaxPeriod::first();
    expect($period->is_claimable)->toBeTrue();
});

test('can submit tax period', function () {
    $taxPeriod = TaxPeriod::create([
        'period' => '2025-06',
        'start_date' => '2025-06-01',
        'end_date' => '2025-06-30',
        'input_tax' => 1000000,
        'output_tax' => 2000000,
        'net_tax' => -1000000,
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->user)
        ->post("/accounting/tax/periods/{$taxPeriod->period}/submit", [
            'notes' => 'Submitted to DJP',
        ]);

    $response->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('tax_periods', [
        'period' => '2025-06',
        'status' => 'submitted',
        'submitted_by' => $this->user->id,
    ]);
});
