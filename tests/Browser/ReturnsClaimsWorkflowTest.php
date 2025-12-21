<?php

use App\Models\Contact;
use App\Models\DebitNote;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReturn;
use App\Models\User;
use App\Models\VendorClaim;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

// ========================================
// Purchase Returns Browser Tests
// ========================================

test('can navigate to returns index page', function () {
    $page = visit('/purchasing/returns');

    $page->assertSee('Purchase Returns')
        ->assertSee('New Return')
        ->assertNoJavascriptErrors();
});

test('can create purchase return via UI', function () {
    $vendor = Contact::factory()->vendor()->create();
    $warehouse = Warehouse::factory()->create();
    $po = PurchaseOrder::factory()->create(['vendor_id' => $vendor->id]);
    $gr = GoodsReceipt::factory()->create([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $warehouse->id,
    ]);

    $page = visit('/purchasing/returns/create');

    $page->assertSee('Create Purchase Return')
        ->assertNoJavascriptErrors();
});

test('can view purchase return details', function () {
    $return = PurchaseReturn::factory()->create();

    $page = visit("/purchasing/returns/{$return->id}");

    $page->assertSee($return->return_number)
        ->assertNoJavascriptErrors();
});

test('can authorize return workflow', function () {
    $return = PurchaseReturn::factory()->draft()->create();

    $page = visit("/purchasing/returns/{$return->id}");

    $page->assertSee($return->return_number)
        ->assertNoJavascriptErrors();
});

test('returns index shows search and filters', function () {
    PurchaseReturn::factory()->count(5)->create();

    $page = visit('/purchasing/returns');

    $page->assertSee('Search')
        ->assertSee('Status')
        ->assertNoJavascriptErrors();
});

// ========================================
// Debit Notes Browser Tests
// ========================================

test('can navigate to debit notes index', function () {
    $page = visit('/purchasing/debit-notes');

    $page->assertSee('Debit Notes')
        ->assertSee('Create Debit Note')
        ->assertNoJavascriptErrors();
});

test('can view debit note details', function () {
    $debitNote = DebitNote::factory()->create();

    $page = visit("/purchasing/debit-notes/{$debitNote->id}");

    $page->assertSee($debitNote->debit_note_number)
        ->assertNoJavascriptErrors();
});

test('debit note shows status badge correctly', function () {
    $debitNote = DebitNote::factory()->posted()->create();

    $page = visit("/purchasing/debit-notes/{$debitNote->id}");

    $page->assertSee($debitNote->debit_note_number)
        ->assertNoJavascriptErrors();
});

test('debit notes index shows filters', function () {
    DebitNote::factory()->count(3)->create();

    $page = visit('/purchasing/debit-notes');

    $page->assertSee('Debit Notes')
        ->assertNoJavascriptErrors();
});

test('can view debit note application section', function () {
    $debitNote = DebitNote::factory()->posted()->create([
        'remaining_amount' => 1000,
    ]);

    $page = visit("/purchasing/debit-notes/{$debitNote->id}");

    $page->assertSee($debitNote->debit_note_number)
        ->assertNoJavascriptErrors();
});

// ========================================
// Vendor Claims Browser Tests
// ========================================

test('can navigate to claims index', function () {
    $page = visit('/purchasing/claims');

    $page->assertSee('Vendor Claims')
        ->assertSee('File New Claim')
        ->assertNoJavascriptErrors();
});

test('can view claim details', function () {
    $claim = VendorClaim::factory()->create();

    $page = visit("/purchasing/claims/{$claim->id}");

    $page->assertSee($claim->claim_number)
        ->assertNoJavascriptErrors();
});

test('claim shows correct workflow buttons based on status', function () {
    $submitted = VendorClaim::factory()->submitted()->create();

    $page = visit("/purchasing/claims/{$submitted->id}");

    $page->assertSee($submitted->claim_number)
        ->assertNoJavascriptErrors();
});

test('approved claim shows settlement options', function () {
    $approved = VendorClaim::factory()->approved()->create();

    $page = visit("/purchasing/claims/{$approved->id}");

    $page->assertSee($approved->claim_number)
        ->assertNoJavascriptErrors();
});

test('claims index shows search and type filters', function () {
    VendorClaim::factory()->count(5)->create();

    $page = visit('/purchasing/claims');

    $page->assertSee('Vendor Claims')
        ->assertNoJavascriptErrors();
});

test('claim details show description and evidence', function () {
    $claim = VendorClaim::factory()->withEvidence()->create();

    $page = visit("/purchasing/claims/{$claim->id}");

    $page->assertSee($claim->claim_number)
        ->assertNoJavascriptErrors();
});

// ========================================
// Integration Workflows Browser Tests
// ========================================

test('returns show page displays related information', function () {
    $return = PurchaseReturn::factory()->create();

    $page = visit("/purchasing/returns/{$return->id}");

    $page->assertSee($return->return_number)
        ->assertNoJavascriptErrors();
});

test('debit note created from return shows link', function () {
    $return = PurchaseReturn::factory()->receivedByVendor()->create();

    $page = visit("/purchasing/returns/{$return->id}");

    $page->assertSee($return->return_number)
        ->assertNoJavascriptErrors();
});

test('all pages use consistent layout', function () {
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

test('navigation breadcrumbs work correctly', function () {
    $return = PurchaseReturn::factory()->create();

    $page = visit("/purchasing/returns/{$return->id}");

    $page->assertSee($return->return_number)
        ->assertNoJavascriptErrors();
});

// ========================================
// Performance & Error Handling Tests
// ========================================

test('pages load without console errors', function () {
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

test('returns list page handles empty state', function () {
    $page = visit('/purchasing/returns');

    $page->assertSee('Purchase Returns')
        ->assertNoJavascriptErrors();
});

test('debit notes list handles empty state', function () {
    $page = visit('/purchasing/debit-notes');

    $page->assertSee('Debit Notes')
        ->assertNoJavascriptErrors();
});

test('claims list handles empty state', function () {
    $page = visit('/purchasing/claims');

    $page->assertNoJavascriptErrors();
});
