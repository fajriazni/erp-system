<?php

use App\Models\TaxPeriod;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('tax reports page loads successfully', function () {
    $this->seed(AccountingSeeder::class);
    $user = User::factory()->create();

    $page = $this->actingAs($user)->visit('/accounting/tax/periods');

    $page->assertSee('Tax Reports');
})->group('browser', 'accounting');

test('shows tax periods in table', function () {
    $this->seed(AccountingSeeder::class);
    $user = User::factory()->create();

    TaxPeriod::create([
        'period' => '2025-01',
        'start_date' => '2025-01-01',
        'end_date' => '2025-01-31',
        'input_tax' => 1000000,
        'output_tax' => 2000000,
        'net_tax' => -1000000,
        'status' => 'draft',
    ]);

    $page = $this->actingAs($user)->visit('/accounting/tax/periods');

    $page->assertSee('2025-01')
        ->assertSee('Draft');
})->group('browser', 'accounting');

test('displays payable tax indicator', function () {
    $this->seed(AccountingSeeder::class);
    $user = User::factory()->create();

    TaxPeriod::create([
        'period' => '2025-02',
        'start_date' => '2025-02-01',
        'end_date' => '2025-02-28',
        'input_tax' => 1000000,
        'output_tax' => 3000000,
        'net_tax' => -2000000,
        'status' => 'draft',
    ]);

    $page = $this->actingAs($user)->visit('/accounting/tax/periods');

    $page->assertSee('2025-02')
        ->assertSee('Payable');
})->group('browser', 'accounting');
