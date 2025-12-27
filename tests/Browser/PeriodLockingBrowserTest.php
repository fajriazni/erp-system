<?php

use App\Models\AccountingPeriod;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(AccountingSeeder::class);
    $this->user = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);
});

test('can access accounting periods page at localhost:8000', function () {
    $page = $this->actingAs($this->user)
        ->visit('http://localhost:8000/accounting/periods');

    // Verify no JavaScript errors (ignore console logs from browser logger)
    $page->assertNoJavascriptErrors();
})->group('browser', 'accounting');

test('can see existing period data in the UI', function () {
    // Create test data
    AccountingPeriod::create([
        'name' => 'Test Period Dec 2024',
        'start_date' => '2024-12-01',
        'end_date' => '2024-12-31',
        'status' => 'open',
    ]);

    $page = $this->actingAs($this->user)
        ->visit('http://localhost:8000/accounting/periods');

    // Verify we can see the period name and status
    $page->assertSee('Test Period Dec 2024')
        ->assertSee('Open')
        ->assertNoJavascriptErrors();
})->group('browser', 'accounting');

test('can see locked period with badge', function () {
    AccountingPeriod::create([
        'name' => 'Locked Period Nov 2024',
        'start_date' => '2024-11-01',
        'end_date' => '2024-11-30',
        'status' => 'locked',
        'locked_by' => $this->user->id,
        'locked_at' => now(),
    ]);

    $page = $this->actingAs($this->user)
        ->visit('http://localhost:8000/accounting/periods');

    $page->assertSee('Locked Period Nov 2024')
        ->assertSee('Locked')
        ->assertNoJavascriptErrors();
})->group('browser', 'accounting');
