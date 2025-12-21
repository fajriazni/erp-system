<?php

use App\Models\DebitNote;
use App\Models\PurchaseReturn;
use App\Models\User;
use App\Models\VendorClaim;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

// ========================================
// CORE UI TESTS - Essential Functionality
// ========================================

test('returns index page loads correctly', function () {
    $page = visit('/purchasing/returns');

    $page->assertSee('Purchase Returns')
        ->assertSee('New Return')
        ->assertNoJavascriptErrors();
});

test('debit notes index page loads correctly', function () {
    $page = visit('/purchasing/debit-notes');

    $page->assertSee('Debit Notes')
        ->assertSee('Create Debit Note')
        ->assertNoJavascriptErrors();
});

test('vendor claims index page loads correctly', function () {
    $page = visit('/purchasing/claims');

    $page->assertSee('Vendor Claims')
        ->assertSee('File New Claim')
        ->assertNoJavascriptErrors();
});

test('returns index shows search functionality', function () {
    PurchaseReturn::factory()->count(3)->create();

    $page = visit('/purchasing/returns');

    $page->assertSee('Search')
        ->assertNoJavascriptErrors();
});

test('debit notes index shows search', function () {
    DebitNote::factory()->count(3)->create();

    $page = visit('/purchasing/debit-notes');

    $page->assertSee('Search')
        ->assertNoJavascriptErrors();
});

test('claims index shows search', function () {
    VendorClaim::factory()->count(3)->create();

    $page = visit('/purchasing/claims');

    $page->assertSee('Search')
        ->assertNoJavascriptErrors();
});

test('returns create page loads', function () {
    $page = visit('/purchasing/returns/create');

    $page->assertSee('Create Purchase Return')
        ->assertNoJavascriptErrors();
});

test('debit notes create page loads', function () {
    $page = visit('/purchasing/debit-notes/create');

    $page->assertSee('Create Debit Note')
        ->assertNoJavascriptErrors();
});

test('claims create page loads', function () {
    $page = visit('/purchasing/claims/create');

    $page->assertSee('File Vendor Claim')
        ->assertNoJavascriptErrors();
});

test('all pages have no javascript errors', function () {
    $pages = [
        '/purchasing/returns',
        '/purchasing/debit-notes',
        '/purchasing/claims',
        '/purchasing/returns/create',
        '/purchasing/debit-notes/create',
        '/purchasing/claims/create',
    ];

    foreach ($pages as $url) {
        $page = visit($url);
        $page->assertNoJavascriptErrors();
    }
});

test('all pages have no console logs', function () {
    $pages = [
        '/purchasing/returns',
        '/purchasing/debit-notes',
        '/purchasing/claims',
    ];

    foreach ($pages as $url) {
        $page = visit($url);
        $page->assertNoConsoleLogs();
    }
});

test('empty states handle gracefully', function () {
    $pages = [
        '/purchasing/returns',
        '/purchasing/debit-notes',
        '/purchasing/claims',
    ];

    foreach ($pages as $url) {
        $page = visit($url);
        $page->assertNoJavascriptErrors();
    }
});
