<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Uom;
use App\Models\User;
use App\Models\VendorBill;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorBillTest extends TestCase
{
    use RefreshDatabase;

    public $user;

    public $vendor;

    public $warehouse;

    public $product;

    public $uom;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        $this->vendor = Contact::create(['name' => 'Test Vendor', 'type' => 'vendor']);
        $this->warehouse = Warehouse::create(['name' => 'Main Warehouse', 'code' => 'WH01']);
        $this->uom = Uom::create(['name' => 'Unit', 'symbol' => 'unit']);
        $this->product = Product::create([
            'name' => 'Test Product',
            'code' => 'P001',
            'type' => 'goods',
            'price' => 100,
            'cost' => 50,
            'uom_id' => $this->uom->id,
            'stock_control' => true,
        ]);
    }

    public function test_can_create_bill_from_po()
    {
        // 1. Create PO
        $po = PurchaseOrder::create([
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'document_number' => 'PO-BILL-001',
            'date' => now(),
            'status' => 'purchase_order',
            'total' => 100,
        ]);
        $po->items()->create([
            'product_id' => $this->product->id,
            'description' => 'Test Item',
            'quantity' => 1,
            'unit_price' => 100,
            'subtotal' => 100,
            'uom_id' => $this->uom->id,
        ]);

        // 2. Visit Create Page with PO ID
        $response = $this->get(route('purchasing.bills.create', ['po_id' => $po->id]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Purchasing/bills/create')
            ->has('purchaseOrder')
        );

        // 3. Store Bill
        // Receive items first to satisfy 3-way matching
        foreach ($po->items as $item) {
            $item->update(['quantity_received' => $item->quantity]);
        }

        $response = $this->post(route('purchasing.bills.store'), [
            'purchase_order_id' => $po->id,
            'vendor_id' => $this->vendor->id,
            'reference_number' => 'INV-001',
            'date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'description' => 'Test Item',
                    'quantity' => 1,
                    'unit_price' => 100,
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('vendor_bills', [
            'purchase_order_id' => $po->id,
            'reference_number' => 'INV-001',
            'status' => 'draft',
        ]);
    }

    public function test_can_post_bill()
    {
        // 1. Create Draft Bill
        $bill = VendorBill::create([
            'vendor_id' => $this->vendor->id,
            'bill_number' => 'BILL-TEST-001',
            'reference_number' => 'INV-TEST',
            'date' => now(),
            'status' => 'draft',
            'total_amount' => 100,
        ]);

        // 2. Post Bill
        $response = $this->post(route('purchasing.bills.post', $bill->id));

        $response->assertSessionHasNoErrors();
        $this->assertEquals('posted', $bill->fresh()->status);
    }

    public function test_create_page_loads_with_po_data()
    {
        $po = PurchaseOrder::create([
            'vendor_id' => $this->vendor->id,
            'warehouse_id' => $this->warehouse->id,
            'document_number' => 'PO-BILL-002',
            'date' => now(),
            'status' => 'purchase_order',
            'total' => 100,
        ]);

        $response = $this->get(route('purchasing.bills.create', ['purchase_order_id' => $po->id]));

        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('Purchasing/bills/create')
            ->has('purchaseOrder')
            ->where('purchaseOrder.id', $po->id)
            ->where('purchaseOrder.vendor_id', $po->vendor_id)
        );
    }
}
