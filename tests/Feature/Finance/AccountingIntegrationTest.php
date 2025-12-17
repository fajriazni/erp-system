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

    public function test_posting_vendor_bill_creates_journal_entry()
    {
        // 1. Create Data
        $vendor = Contact::factory()->create(['type' => 'vendor', 'name' => 'Test Vendor']);
        $product = Product::factory()->create();

        $bill = VendorBill::create([
            'vendor_id' => $vendor->id,
            'bill_number' => 'BILL-TEST-001',
            'reference_number' => 'REF001',
            'date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'draft',
            'total_amount' => 100000,
        ]);

        $service = app(PostVendorBillService::class);

        // 2. Execute Service
        $service->execute($bill);

        // 3. Assertions
        $this->assertEquals('posted', $bill->fresh()->status);

        // Check Header
        $this->assertDatabaseHas('journal_entries', [
            'reference_number' => 'BILL-TEST-001',
            'description' => 'Vendor Bill #BILL-TEST-001 - Test Vendor',
        ]);

        $journalEntry = JournalEntry::where('reference_number', 'BILL-TEST-001')->first();

        // Check Lines (Clearing Debit, AP Credit)
        // Clearing (2110) Debit 100000
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2110')->first()->id,
            'debit' => 100000,
            'credit' => 0,
        ]);

        // AP (2100) Credit 100000
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2100')->first()->id,
            'debit' => 0,
            'credit' => 100000,
        ]);
    }

    public function test_posting_goods_receipt_creates_journal_entry()
    {
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

        // Header
        $this->assertDatabaseHas('journal_entries', [
            'reference_number' => 'GR-TEST-002',
            'description' => 'Goods Receipt #GR-TEST-002 - PO #PO-TEST-002',
        ]);

        $journalEntry = JournalEntry::where('reference_number', 'GR-TEST-002')->first();

        // Check Lines (Inventory Debit, Clearing Credit)
        // Inventory (1400) Debit 50000 (10 * 5000)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '1400')->first()->id,
            'debit' => 50000,
            'credit' => 0,
        ]);

        // Clearing (2110) Credit 50000
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2110')->first()->id,
            'debit' => 0,
            'credit' => 50000,
        ]);
    }
}
