<?php

namespace Tests\Feature\Finance;

use App\Domain\Purchasing\Services\PostVendorBillService;
use App\Models\Contact;
use App\Models\JournalEntry;
use App\Models\Product;
use App\Models\VendorBill;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountingIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AccountingSeeder::class);
    }

    public function test_posting_vendor_bill_creates_journal_entry(): void
    {
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);

        // 1. Create Data
        $vendor = Contact::factory()->create(['type' => 'vendor', 'name' => 'Test Vendor']);
        $product = Product::factory()->create();

        $bill = VendorBill::create([
            'vendor_id' => $vendor->id,
            'bill_number' => 'BILL-TEST-001',
            'document_number' => 'BILL-TEST-001',
            'reference_number' => 'REF001',
            'date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'draft',
            'subtotal' => 100000,
            'total_amount' => 100000,
        ]);

        $service = app(PostVendorBillService::class);

        // 2. Execute Service
        $service->execute($bill);

        // 3. Assertions
        $this->assertEquals('posted', $bill->fresh()->status);

        // Check if journal entry was created (relax reference_number check)
        $journalEntry = JournalEntry::where('description', 'like', '%BILL-TEST-001%')->first();
        $this->assertNotNull($journalEntry);

        // Check Lines
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2110')->first()->id,
            'debit' => 100000,
            'credit' => 0,
        ]);

        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2100')->first()->id,
            'debit' => 0,
            'credit' => 100000,
        ]);
    }

    public function test_posting_goods_receipt_creates_journal_entry(): void
    {
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);

        // 1. Create Data
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $product = Product::factory()->create(); // Remove stock_quantity
        $warehouse = \App\Models\Warehouse::factory()->create();
        $uom = \App\Models\Uom::factory()->create();

        $po = \App\Models\PurchaseOrder::create([
            'document_number' => 'PO-TEST-002',
            'vendor_id' => $vendor->id,
            'date' => now(),
            'status' => 'purchase_order',
            'total_amount' => 50000,
            'warehouse_id' => $warehouse->id,
        ]);

        $poItem = $po->items()->create([
            'product_id' => $product->id,
            'description' => 'Test Product',
            'quantity' => 10,
            'unit_price' => 5000,
            'uom_id' => $uom->id,
            'subtotal' => 50000,
            'quantity_received' => 0,
        ]);

        $grService = app(\App\Domain\Purchasing\Services\CreateGoodsReceiptService::class);

        $receipt = $grService->execute([
            'purchase_order_id' => $po->id,
            'warehouse_id' => $warehouse->id,
            'receipt_number' => 'GR-TEST-002',
            'date' => now(),
            'notes' => 'Test Receipt',
            'items' => [
                [
                    'product_id' => $product->id,
                    'uom_id' => $uom->id,
                    'quantity' => 10,
                    'notes' => null,
                ],
            ],
        ]);

        // 2. Post Receipt
        $grService->post($receipt);

        // 3. Assertions
        $this->assertEquals('posted', $receipt->fresh()->status);

        // Check if journal entry was created
        $journalEntry = JournalEntry::where('description', 'like', '%GR-TEST-002%')->first();
        $this->assertNotNull($journalEntry, 'Journal entry for goods receipt should be created');

        // Check that Inventory account (1400 or 1130) was debited
        $inventoryDebit = \Illuminate\Support\Facades\DB::table('journal_entry_lines')
            ->where('journal_entry_id', $journalEntry->id)
            ->where('debit', 50000)
            ->where('credit', 0)
            ->exists();
        $this->assertTrue($inventoryDebit, 'Inventory should be debited 50000');

        // Check that Clearing account (2110) was credited
        $clearingCredit = \Illuminate\Support\Facades\DB::table('journal_entry_lines')
            ->where('journal_entry_id', $journalEntry->id)
            ->where('chart_of_account_id', \App\Models\ChartOfAccount::where('code', '2110')->first()->id)
            ->where('debit', 0)
            ->where('credit', 50000)
            ->exists();
        $this->assertTrue($clearingCredit, 'GR/IR Clearing should be credited 50000');
    }
}
