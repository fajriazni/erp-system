<?php

namespace Tests\Feature\Purchasing;

use App\Domain\Purchasing\Services\CreateGoodsReceiptService;
use App\Domain\Purchasing\Services\CreateVendorBillService;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Uom;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchasingHardeningTest extends TestCase
{
    use RefreshDatabase;

    public $user;

    protected $warehouse;

    protected $vendor;

    protected $product;

    protected $product2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        $this->warehouse = Warehouse::factory()->create();
        $this->vendor = Contact::factory()->create(['type' => 'vendor']);

        $uom = Uom::factory()->create();
        $this->product = Product::factory()->create(['uom_id' => $uom->id]);
        $this->product2 = Product::factory()->create(['uom_id' => $uom->id]);
    }

    public function test_goods_receipt_tracks_per_item()
    {
        // 1. Create PO with 2 items
        $po = PurchaseOrder::create([
            'document_number' => 'PO-TEST-001',
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'date' => now(),
            'status' => 'purchase_order', // Assume approved
            'total' => 200,
        ]);

        $item1 = $po->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 10,
            'unit_price' => 10,
            'subtotal' => 100,
            'uom_id' => $this->product->uom_id,
        ]);

        $item2 = $po->items()->create([
            'product_id' => $this->product2->id,
            'quantity' => 10,
            'unit_price' => 10,
            'subtotal' => 100,
            'uom_id' => $this->product2->uom_id,
        ]);

        // 2. Receive Partial (Item 1 only, half quantity)
        $service = app(CreateGoodsReceiptService::class);
        $gr = $service->execute([
            'purchase_order_id' => $po->id,
            'warehouse_id' => $this->warehouse->id,
            'receipt_number' => 'GR-001',
            'date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'uom_id' => $this->product->uom_id,
                    'quantity' => 5, // Received 5 of 10
                ],
            ],
        ]);

        $service->post($gr);

        // 3. Verify
        $po->refresh();
        $item1->refresh();
        $item2->refresh();

        $this->assertEquals(5, $item1->quantity_received);
        $this->assertEquals(0, $item2->quantity_received);
        $this->assertEquals('partial_received', $po->status);

        // 4. Receive Remaining
        $gr2 = $service->execute([
            'purchase_order_id' => $po->id,
            'warehouse_id' => $this->warehouse->id,
            'receipt_number' => 'GR-002',
            'date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'uom_id' => $this->product->uom_id,
                    'quantity' => 5, // Remaining 5
                ],
                [
                    'product_id' => $this->product2->id,
                    'uom_id' => $this->product2->uom_id,
                    'quantity' => 10, // Full 10
                ],
            ],
        ]);
        $service->post($gr2);

        $po->refresh();
        $this->assertEquals('completed', $po->status);
    }

    public function test_vendor_bill_3_way_matching_fail()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Cannot bill quantity');

        // 1. Create PO
        $po = PurchaseOrder::create([
            'document_number' => 'PO-TEST-002',
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'date' => now(),
            'status' => 'purchase_order',
            'total' => 100,
        ]);
        $po->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 10,
            'unit_price' => 10,
            'subtotal' => 100,
            'uom_id' => $this->product->uom_id,
            'quantity_received' => 5, // Only received 5
        ]);

        // 2. Try to Bill 6 (Fail)
        $service = app(CreateVendorBillService::class);
        $service->execute([
            'purchase_order_id' => $po->id,
            'vendor_id' => $this->vendor->id,
            'reference_number' => 'INV-001',
            'date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'description' => 'Test',
                    'quantity' => 6, // Exceeds received (5)
                    'unit_price' => 10,
                ],
            ],
        ]);
    }

    public function test_vendor_bill_3_way_matching_success()
    {
        // 1. Create PO
        $po = PurchaseOrder::create([
            'document_number' => 'PO-TEST-003',
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'date' => now(),
            'status' => 'purchase_order',
            'total' => 100,
        ]);
        $item = $po->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 10,
            'unit_price' => 10,
            'subtotal' => 100,
            'uom_id' => $this->product->uom_id,
            'quantity_received' => 5, // Received 5
            'quantity_billed' => 0,
        ]);

        // 2. Bill 5 (Success)
        $service = app(CreateVendorBillService::class);
        $bill = $service->execute([
            'purchase_order_id' => $po->id,
            'vendor_id' => $this->vendor->id,
            'reference_number' => 'INV-002',
            'date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'description' => 'Test',
                    'quantity' => 5, // Matches available
                    'unit_price' => 10,
                ],
            ],
        ]);

        $item->refresh();
        $this->assertEquals(5, $item->quantity_billed);
        $this->assertDatabaseHas('vendor_bills', ['id' => $bill->id]);
    }
}
