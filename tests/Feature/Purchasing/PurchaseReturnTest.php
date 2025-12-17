<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseReturn;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PurchaseReturnTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_can_create_purchase_return()
    {
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $warehouse = Warehouse::factory()->create();
        $product = Product::factory()->create(['cost' => 1000]);

        $response = $this->post(route('purchasing.returns.store'), [
            'vendor_id' => $vendor->id,
            'warehouse_id' => $warehouse->id,
            'date' => now()->startOfDay()->format('Y-m-d'), // Use startOfDay to match database date type behavior
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5,
                    'unit_price' => 1000,
                ],
            ],
            'notes' => 'Test Return',
        ]);

        $response->assertRedirect(route('purchasing.returns.index'));

        $this->assertDatabaseHas('purchase_returns', [
            'vendor_id' => $vendor->id,
            'warehouse_id' => $warehouse->id,
            'amount' => 5000,
            'status' => 'draft',
        ]);

        $this->assertDatabaseHas('purchase_return_lines', [
            'product_id' => $product->id,
            'quantity' => 5,
            'total' => 5000,
        ]);
    }

    public function test_can_post_purchase_return_and_reduce_stock()
    {
        // Seed COA
        \App\Models\ChartOfAccount::create(['code' => '2000', 'name' => 'Accounts Payable', 'type' => 'LIABILITY']);
        \App\Models\ChartOfAccount::create(['code' => '1200', 'name' => 'Inventory Asset', 'type' => 'ASSET']);

        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $warehouse = Warehouse::factory()->create();
        $product = Product::factory()->create(); // Initial Stock

        // Initial warehouse stock
        DB::table('product_warehouse')->insert([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 50,
        ]);

        $return = PurchaseReturn::create([
            'document_number' => 'RET-TEST-001',
            'vendor_id' => $vendor->id,
            'warehouse_id' => $warehouse->id,
            'date' => now(),
            'status' => 'draft',
            'amount' => 5000,
        ]);

        $return->lines()->create([
            'product_id' => $product->id,
            'quantity' => 5,
            'unit_price' => 1000,
            'total' => 5000,
        ]);

        // Mock Chart of Accounts for Journal Entry if needed or rely on database presence
        /*
           If CreateJournalEntryService uses real DB checks, we might need to seed COA.
           But usually for tests we might get away if validation is lax or we seed.
           Let's allow failure if COA missing and fix if needed.
           Alternatively, mock the service if we want to test isolation, but integration is better.
        */

        // POST request
        $response = $this->post(route('purchasing.returns.post', $return));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(); // Back

        $this->assertDatabaseHas('purchase_returns', [
            'id' => $return->id,
            'status' => 'posted',
        ]);

        // Verify Stock Reduction
        $this->assertDatabaseHas('product_warehouse', [
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 45, // 50 - 5
        ]);
    }
}
