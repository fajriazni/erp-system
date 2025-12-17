<?php

namespace Tests\Feature\Inventory;

use App\Domain\Purchasing\Services\CreateGoodsReceiptService;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Uom;
use App\Models\Warehouse;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProductCostingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AccountingSeeder::class);
    }

    public function test_initial_stock_sets_cost_to_purchase_price()
    {
        // 1. Setup Data
        $warehouse = Warehouse::factory()->create();
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $uom = Uom::factory()->create();
        $product = Product::factory()->create([
            'uom_id' => $uom->id,
            'cost' => 0, // Initial cost 0
        ]);

        // Purchase Order @ 50,000
        $po = PurchaseOrder::create([
            'document_number' => 'PO-COST-01',
            'vendor_id' => $vendor->id,
            'date' => now(),
            'status' => 'approved',
            'warehouse_id' => $warehouse->id,
            'amount' => 500000,
        ]);

        $po->items()->create([
            'product_id' => $product->id,
            'uom_id' => $uom->id,
            'quantity' => 10,
            'unit_price' => 50000,
            'subtotal' => 500000,
        ]);

        // 2. Execute Goods Receipt
        $service = app(CreateGoodsReceiptService::class);
        $receipt = $service->execute([
            'purchase_order_id' => $po->id,
            'warehouse_id' => $warehouse->id,
            'receipt_number' => 'GR-COST-01',
            'date' => now()->format('Y-m-d'),
            'items' => [
                [
                    'product_id' => $product->id,
                    'uom_id' => $uom->id,
                    'quantity' => 10,
                ],
            ],
        ]);

        $service->post($receipt);

        // 3. Verify Product Cost
        // Should be exactly 50,000
        $this->assertEquals(50000, $product->fresh()->cost);
    }

    public function test_weighted_average_calculation()
    {
        // 1. Setup Initial Stock: 10 units @ 50,000 = 500,000 Value
        $warehouse = Warehouse::factory()->create();
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $uom = Uom::factory()->create();
        $product = Product::factory()->create([
            'uom_id' => $uom->id,
            'cost' => 50000,
        ]);

        // Manually seed existing stock
        DB::table('product_warehouse')->insert([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 10,
        ]);

        // 2. Incoming Stock: 10 units @ 60,000 = 600,000 Value
        // Total Value = 1,100,000
        // Total Qty = 20
        // New Cost = 55,000

        $po = PurchaseOrder::create([
            'document_number' => 'PO-COST-02',
            'vendor_id' => $vendor->id,
            'date' => now(),
            'status' => 'approved',
            'warehouse_id' => $warehouse->id,
            'amount' => 600000,
        ]);

        $po->items()->create([
            'product_id' => $product->id,
            'uom_id' => $uom->id,
            'quantity' => 10,
            'unit_price' => 60000,
            'subtotal' => 600000,
        ]);

        // 3. Execute Goods Receipt
        $service = app(CreateGoodsReceiptService::class);
        $receipt = $service->execute([
            'purchase_order_id' => $po->id,
            'warehouse_id' => $warehouse->id,
            'receipt_number' => 'GR-COST-02',
            'date' => now()->format('Y-m-d'),
            'items' => [
                [
                    'product_id' => $product->id,
                    'uom_id' => $uom->id,
                    'quantity' => 10,
                ],
            ],
        ]);

        $service->post($receipt);

        // 4. Verify Product Cost
        $this->assertEquals(55000, $product->fresh()->cost);
    }
}
