<?php

use App\Models\Contact;
use App\Models\GoodsReceipt;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Warehouse;

use function Pest\Laravel\actingAs;

/**
 * @property User $user
 * @property Contact $vendor
 * @property Warehouse $warehouse
 * @property Product $product
 * @property \App\Models\Uom $uom
 */
beforeEach(function () {
    $this->user = User::factory()->create();
    $this->vendor = Contact::factory()->create(['type' => 'vendor']);
    $this->warehouse = Warehouse::factory()->create();
    $this->product = Product::factory()->create();
    $this->uom = \App\Models\Uom::factory()->create();

    actingAs($this->user);
});

it('displays goods receipt index page correctly', function () {
    $page = visit('/purchasing/receipts');

    $page->assertSee('Goods Receipts')
        ->assertNoJavascriptErrors();
});

it('can view goods receipt details', function () {
    $po = PurchaseOrder::factory()->create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'purchase_order',
    ]);

    $gr = GoodsReceipt::factory()->create([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'draft',
    ]);

    $gr->items()->create([
        'product_id' => $this->product->id,
        'uom_id' => $this->uom->id,
        'quantity_received' => 10,
    ]);

    $page = visit("/purchasing/receipts/{$gr->id}");

    $page->assertSee($gr->receipt_number)
        ->assertSee($po->document_number)
        ->assertNoJavascriptErrors();
});

it('shows qc inspection tab on goods receipt show page', function () {
    $po = PurchaseOrder::factory()->create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
    ]);

    $gr = GoodsReceipt::factory()->create([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'posted',
    ]);

    $page = visit("/purchasing/receipts/{$gr->id}");

    $page->assertSee('Items')
        ->assertSee('Quality Control')
        ->assertNoJavascriptErrors();
});

it('can navigate to edit page from show page', function () {
    $po = PurchaseOrder::factory()->create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
    ]);

    $gr = GoodsReceipt::factory()->create([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'draft',
    ]);

    $page = visit("/purchasing/receipts/{$gr->id}");

    // Check if edit button exists (for draft status)
    $page->assertSee('Edit')
        ->assertNoJavascriptErrors();
});
