<?php

use App\Domain\Purchasing\Services\ThreeWayMatchService;
use App\Models\Contact;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\User;
use App\Models\VendorBill;
use App\Models\VendorBillItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->service = app(ThreeWayMatchService::class);

    // Create vendor
    $this->vendor = Contact::create([
        'name' => 'Test Vendor',
        'type' => 'vendor',
        'email' => 'vendor@test.com',
    ]);

    // Create warehouse
    $this->warehouse = \App\Models\Warehouse::firstOrCreate(
        ['code' => 'WH-TEST'],
        ['name' => 'Test Warehouse']
    );

    // Create UoM for foreign key
    $this->uom = \App\Models\Uom::firstOrCreate(
        ['code' => 'PCS'],
        ['name' => 'Pieces', 'conversion_factor' => 1]
    );

    // Create product
    $this->product = Product::create([
        'name' => 'Test Product',
        'code' => 'TEST-001',
        'uom_id' => $this->uom->id,
        'price' => 100,
        'cost' => 80,
    ]);
});

it('returns matched when quantities and prices align', function () {
    // 1. Create PO
    $po = PurchaseOrder::create([
        'document_number' => 'PO-TEST-001',
        'vendor_id' => $this->vendor->id,
        'status' => 'purchase_order',
        'warehouse_id' => $this->warehouse->id,
        'date' => now(),
        'total' => 1000,
    ]);

    PurchaseOrderItem::create([
        'purchase_order_id' => $po->id,
        'product_id' => $this->product->id,
        'quantity' => 10,
        'unit_price' => 100,
        'subtotal' => 1000,
    ]);

    // 2. Create GR (received all 10)
    $gr = GoodsReceipt::create([
        'receipt_number' => 'GR-TEST-001',
        'purchase_order_id' => $po->id,
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'posted',
        'date' => now(),
    ]);

    GoodsReceiptItem::create([
        'goods_receipt_id' => $gr->id,
        'product_id' => $this->product->id,
        'uom_id' => $this->uom->id,
        'quantity_received' => 10,
    ]);

    // 3. Create Bill (billed all 10 at same price)
    $bill = VendorBill::create([
        'purchase_order_id' => $po->id,
        'vendor_id' => $this->vendor->id,
        'bill_number' => 'BILL-TEST-001',
        'status' => 'draft',
        'date' => now(),
        'due_date' => now()->addDays(30),
        'total_amount' => 1000,
    ]);

    VendorBillItem::create([
        'vendor_bill_id' => $bill->id,
        'product_id' => $this->product->id,
        'description' => 'Test Product',
        'quantity' => 10,
        'unit_price' => 100,
        'total' => 1000,
    ]);

    // 4. Run match
    $result = $this->service->match($bill);

    expect($result->status)->toBe('matched');
    expect($result->hasExceptions())->toBeFalse();
});

it('flags exception when billed quantity exceeds received', function () {
    $po = PurchaseOrder::create([
        'document_number' => 'PO-TEST-002',
        'vendor_id' => $this->vendor->id,
        'status' => 'purchase_order',
        'warehouse_id' => $this->warehouse->id,
        'date' => now(),
        'total' => 1000,
    ]);

    PurchaseOrderItem::create([
        'purchase_order_id' => $po->id,
        'product_id' => $this->product->id,
        'quantity' => 10,
        'unit_price' => 100,
        'subtotal' => 1000,
    ]);

    // GR only received 5
    $gr = GoodsReceipt::create([
        'receipt_number' => 'GR-TEST-002',
        'purchase_order_id' => $po->id,
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'posted',
        'date' => now(),
    ]);

    GoodsReceiptItem::create([
        'goods_receipt_id' => $gr->id,
        'product_id' => $this->product->id,
        'uom_id' => $this->uom->id,
        'quantity_received' => 5,
    ]);

    // Bill for 10 (more than received)
    $bill = VendorBill::create([
        'purchase_order_id' => $po->id,
        'vendor_id' => $this->vendor->id,
        'bill_number' => 'BILL-TEST-002',
        'status' => 'draft',
        'date' => now(),
        'due_date' => now()->addDays(30),
        'total_amount' => 1000,
    ]);

    VendorBillItem::create([
        'vendor_bill_id' => $bill->id,
        'product_id' => $this->product->id,
        'description' => 'Test Product',
        'quantity' => 10,
        'unit_price' => 100,
        'total' => 1000,
    ]);

    $result = $this->service->match($bill);

    expect($result->status)->toBe('exception');
    expect($result->hasExceptions())->toBeTrue();
    expect($result->exceptions)->toHaveCount(1);
    expect($result->exceptions[0]['type'])->toBe('qty_over_received');
});

it('flags exception when billed price exceeds PO price beyond tolerance', function () {
    $po = PurchaseOrder::create([
        'document_number' => 'PO-TEST-003',
        'vendor_id' => $this->vendor->id,
        'status' => 'purchase_order',
        'warehouse_id' => $this->warehouse->id,
        'date' => now(),
        'subtotal' => 1000,
    ]);

    PurchaseOrderItem::create([
        'purchase_order_id' => $po->id,
        'product_id' => $this->product->id,
        'quantity' => 10,
        'unit_price' => 100,
        'subtotal' => 1000,
    ]);

    $gr = GoodsReceipt::create([
        'receipt_number' => 'GR-TEST-003',
        'purchase_order_id' => $po->id,
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'status' => 'posted',
        'date' => now(),
    ]);

    GoodsReceiptItem::create([
        'goods_receipt_id' => $gr->id,
        'product_id' => $this->product->id,
        'uom_id' => $this->uom->id,
        'quantity_received' => 10,
    ]);

    // Bill at 120 (20% over PO price of 100, exceeds 5% tolerance)
    $bill = VendorBill::create([
        'purchase_order_id' => $po->id,
        'vendor_id' => $this->vendor->id,
        'bill_number' => 'BILL-TEST-003',
        'status' => 'draft',
        'date' => now(),
        'due_date' => now()->addDays(30),
        'total_amount' => 1200,
    ]);

    VendorBillItem::create([
        'vendor_bill_id' => $bill->id,
        'product_id' => $this->product->id,
        'description' => 'Test Product',
        'quantity' => 10,
        'unit_price' => 120,
        'total' => 1200,
    ]);

    $result = $this->service->match($bill);

    expect($result->status)->toBe('exception');
    expect($result->hasExceptions())->toBeTrue();
    expect($result->exceptions[0]['type'])->toBe('price_over_po');
});
