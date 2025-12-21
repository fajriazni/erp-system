<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\GoodsReceipt;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Uom;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class GoodsReceiptTest extends TestCase
{
    use RefreshDatabase;

    public $user;

    protected $warehouse;

    protected $uom;

    protected $product;

    protected $vendor;

    protected $po;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Setup master data
        $this->warehouse = Warehouse::create(['name' => 'Main Warehouse', 'code' => 'WH01']);
        $this->uom = Uom::create(['name' => 'Unit', 'symbol' => 'unit']);
        $this->product = Product::create([
            'name' => 'Test Product',
            'code' => 'TP001',
            'type' => 'goods',
            'price' => 100,
            'cost' => 50,
            'uom_id' => $this->uom->id,
            'stock_control' => true,
        ]);
        $this->vendor = Contact::create(['name' => 'Test Vendor', 'type' => 'vendor']);

        // Setup active PO
        $this->po = PurchaseOrder::create([
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'document_number' => 'PO-001',
            'date' => now(),
            'status' => 'purchase_order', // Approved status
            'total' => 500,
        ]);

        $this->po->items()->create([
            'product_id' => $this->product->id,
            'uom_id' => $this->uom->id,
            'quantity' => 10,
            'unit_price' => 50,
            'subtotal' => 500,
        ]);
    }

    public function test_can_create_goods_receipt_draft()
    {
        $response = $this->post(route('purchasing.receipts.store'), [
            'purchase_order_id' => $this->po->id,
            'warehouse_id' => $this->warehouse->id,
            'date' => now()->toDateString(),
            'receipt_number' => 'GR-001',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'uom_id' => $this->uom->id,
                    'quantity' => 5, // Partial receive
                ],
            ],
        ]);

        $response->assertRedirect(route('purchasing.receipts.index'));

        $this->assertDatabaseHas('goods_receipts', [
            'purchase_order_id' => $this->po->id,
            'status' => 'draft',
            'receipt_number' => 'GR-001',
        ]);

        $this->assertDatabaseHas('goods_receipt_items', [
            'product_id' => $this->product->id,
            'quantity_received' => 5,
        ]);
    }

    public function test_posting_goods_receipt_updates_inventory_and_po_status()
    {
        // 1. Create Draft
        $gr = GoodsReceipt::create([
            'purchase_order_id' => $this->po->id,
            'warehouse_id' => $this->warehouse->id,
            'receipt_number' => 'GR-002',
            'date' => now(),
            'status' => 'draft',
        ]);

        $gr->items()->create([
            'product_id' => $this->product->id,
            'uom_id' => $this->uom->id,
            'quantity_received' => 5,
        ]);

        // 2. Post Receipt
        $response = $this->post(route('purchasing.receipts.post', $gr));
        $response->assertSessionHas('success');

        // 3. Verify Status
        $this->assertEquals('posted', $gr->fresh()->status);

        // 4. Verify Inventory
        $stock = DB::table('product_warehouse')
            ->where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouse->id)
            ->first();

        $this->assertNotNull($stock);
        $this->assertEquals(5, $stock->quantity);

        // 5. Verify PO Status (Partial)
        $this->assertEquals('partial_received', $this->po->fresh()->status);

        // 6. Create another GR for remaining 5
        $gr2 = GoodsReceipt::create([
            'purchase_order_id' => $this->po->id,
            'warehouse_id' => $this->warehouse->id,
            'receipt_number' => 'GR-003',
            'date' => now(),
            'status' => 'draft',
        ]);
        $gr2->items()->create([
            'product_id' => $this->product->id,
            'uom_id' => $this->uom->id,
            'quantity_received' => 5,
        ]);

        $this->post(route('purchasing.receipts.post', $gr2));

        // 7. Verify PO Status (Fully Received)
        $this->assertEquals('fully_received', $this->po->fresh()->status);

        // 8. Verify Inventory increases
        $stock = DB::table('product_warehouse')
            ->where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouse->id)
            ->first();
        $this->assertEquals(10, $stock->quantity);
    }
}
