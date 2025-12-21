<?php

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Warehouse;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->vendor = Contact::factory()->create(['type' => 'vendor']);
    $this->warehouse = Warehouse::factory()->create();
    $this->product = Product::factory()->create();

    actingAs($this->user);
});

it('can navigate through complete purchasing flow', function () {
    // 1. Create Purchase Request
    $page = visit('/purchasing/requests/create');

    $page->assertSee('Create Purchase Request')
        ->assertNoJavascriptErrors();

    // 2. Navigate to RFQ
    $page = visit('/purchasing/rfqs');
    $page->assertSee('Request for Quotation')
        ->assertNoJavascriptErrors();

    // 3. Navigate to Purchase Orders
    $page = visit('/purchasing/orders');
    $page->assertSee('Purchase Orders')
        ->assertNoJavascriptErrors();

    // 4. Navigate to Goods Receipts
    $page = visit('/purchasing/receipts');
    $page->assertSee('Goods Receipts')
        ->assertNoJavascriptErrors();
});

it('can create and view purchase order', function () {
    // Create a PO via backend
    $po = PurchaseOrder::factory()->create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'purchase_order',
    ]);

    $po->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 10,
        'unit_price' => 1000,
        'subtotal' => 10000,
    ]);

    // Visit show page
    $page = visit("/purchasing/orders/{$po->id}");

    $page->assertSee($po->document_number)
        ->assertSee($this->vendor->name)
        ->assertSee($this->product->name)
        ->assertNoJavascriptErrors();
});

it('can access goods receipt create page', function () {
    $po = PurchaseOrder::factory()->create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'purchase_order',
    ]);

    $page = visit('/purchasing/receipts/create?po_id='.$po->id);

    $page->assertSee('Create Goods Receipt')
        ->assertNoJavascriptErrors()
        ->assertNoConsoleLogs();
});

it('can view blanket orders index', function () {
    $page = visit('/purchasing/blanket-orders');

    $page->assertSee('Blanket Purchase Orders')
        ->assertNoJavascriptErrors();
});

it('can view contracts index', function () {
    $page = visit('/purchasing/contracts');

    $page->assertSee('Purchase Agreements')
        ->assertNoJavascriptErrors();
});
