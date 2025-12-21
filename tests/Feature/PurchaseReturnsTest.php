<?php

use App\Domain\Purchasing\Services\CreatePurchaseReturnService;
use App\Models\Contact;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReturn;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('can create purchase return', function () {
    $vendor = Contact::factory()->vendor()->create();
    $warehouse = Warehouse::factory()->create();
    $po = PurchaseOrder::factory()->create(['vendor_id' => $vendor->id]);
    $product = \App\Models\Product::factory()->create();
    $uom = \App\Models\Uom::factory()->create();

    $response = $this->postJson('/purchasing/returns', [
        'purchase_order_id' => $po->id,
        'vendor_id' => $vendor->id,
        'warehouse_id' => $warehouse->id,
        'return_date' => now()->format('Y-m-d'),
        'reason' => 'Damaged goods',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 10,
                'uom_id' => $uom->id,
                'unit_price' => 100,
                'condition' => 'damaged',
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('purchase_returns', [
        'vendor_id' => $vendor->id,
        'reason' => 'Damaged goods',
    ]);
});

test('can authorize return with rma number', function () {
    $return = PurchaseReturn::factory()->create(['status' => 'draft']);

    $response = $this->post("/purchasing/returns/{$return->id}/authorize", [
        'rma_number' => 'RMA-TEST-001',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('purchase_returns', [
        'id' => $return->id,
        'rma_number' => 'RMA-TEST-001',
        'status' => 'ready_to_ship',
    ]);
});

test('can ship return and decrease inventory', function () {
    $return = PurchaseReturn::factory()->create([
        'status' => 'ready_to_ship',
        'rma_number' => 'RMA-001',
    ]);

    $response = $this->post("/purchasing/returns/{$return->id}/ship");

    $response->assertRedirect();
    $this->assertDatabaseHas('purchase_returns', [
        'id' => $return->id,
        'status' => 'shipped',
    ]);
});

test('can mark return as received by vendor', function () {
    $return = PurchaseReturn::factory()->create(['status' => 'shipped']);

    $response = $this->post("/purchasing/returns/{$return->id}/receive");

    $response->assertRedirect();
    $this->assertDatabaseHas('purchase_returns', [
        'id' => $return->id,
        'status' => 'received_by_vendor',
    ]);

    // Should auto-create debit note
    $this->assertDatabaseHas('debit_notes', [
        'purchase_return_id' => $return->id,
    ]);
});

test('can cancel return', function () {
    $return = PurchaseReturn::factory()->create(['status' => 'draft']);

    $response = $this->post("/purchasing/returns/{$return->id}/cancel", [
        'reason' => 'Wrong vendor',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('purchase_returns', [
        'id' => $return->id,
        'status' => 'cancelled',
        'cancellation_reason' => 'Wrong vendor',
    ]);
});

test('cannot ship return without rma number', function () {
    $return = PurchaseReturn::factory()->create([
        'status' => 'pending_authorization',
        'rma_number' => null,
    ]);

    $this->expectException(\Exception::class);

    app(CreatePurchaseReturnService::class)->ship($return);
});

test('purchase return has correct status flow', function () {
    $return = PurchaseReturn::factory()->create(['status' => 'draft']);

    expect($return->status)->toBe('draft');

    $return->authorize('RMA-001');
    expect($return->fresh()->status)->toBe('ready_to_ship');

    app(CreatePurchaseReturnService::class)->ship($return->fresh());
    expect($return->fresh()->status)->toBe('shipped');

    app(CreatePurchaseReturnService::class)->receiveByVendor($return->fresh());
    expect($return->fresh()->status)->toBe('received_by_vendor');

    $return->fresh()->complete();
    expect($return->fresh()->status)->toBe('completed');
});
