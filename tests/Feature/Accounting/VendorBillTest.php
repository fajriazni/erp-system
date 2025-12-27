<?php

namespace Tests\Feature\Accounting;

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\VendorBill;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorBillTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AccountingSeeder::class);
        $this->actingAs(\App\Models\User::factory()->create());
    }

    public function test_can_create_standalone_vendor_bill()
    {
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $product = Product::factory()->create();

        $response = $this->post(route('accounting.bills.store'), [
            'vendor_id' => $vendor->id,
            'reference_number' => 'REF-001',
            'date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'tax_rate' => 11,
            'tax_inclusive' => false,
            'items' => [
                [
                    'product_id' => $product->id,
                    'description' => 'Test Item',
                    'quantity' => 10,
                    'unit_price' => 1000,
                ],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('vendor_bills', [
            'vendor_id' => $vendor->id,
            'reference_number' => 'REF-001',
            'total_amount' => 11100.00, // 10000 + 1100 tax
        ]);

        $bill = VendorBill::where('reference_number', 'REF-001')->first();
        $this->assertDatabaseHas('vendor_bill_items', [
            'vendor_bill_id' => $bill->id,
            'product_id' => $product->id,
            'total' => 10000,
        ]);
    }

    public function test_can_post_vendor_bill_and_generate_journal_entry()
    {
        $vendor = Contact::factory()->create(['type' => 'vendor']);

        $bill = VendorBill::create([
            'vendor_id' => $vendor->id,
            'bill_number' => 'BILL-POST-TEST',
            'reference_number' => 'REF-POST',
            'date' => now(),
            'status' => 'draft',
            'total_amount' => 11100,
            'subtotal' => 10000,
            'tax_amount' => 1100,
            'tax_rate' => 11,
        ]);

        $response = $this->post(route('accounting.bills.post', $bill));

        if (session('error')) {
            dump(session('error'));
        }

        $response->assertSessionHasNoErrors();
        $this->assertEquals('posted', $bill->fresh()->status);

        // Check Journal Entry
        $this->assertDatabaseHas('journal_entries', [
            'reference_number' => 'BILL-POST-TEST',
        ]);

        // Check GL Lines
        $entry = \App\Models\JournalEntry::where('reference_number', 'BILL-POST-TEST')->first();

        // Credit AP (2100)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2100')->first()->id,
            'credit' => 11100,
        ]);

        // Debit Clearing (2110)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2110')->first()->id,
            'debit' => 10000,
        ]);

        // Debit Input Tax (1401)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '1401')->first()->id,
            'debit' => 1100,
        ]);
    }

    public function test_cannot_bill_more_than_received_on_po()
    {
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $product = Product::factory()->create();

        $po = PurchaseOrder::create([
            'vendor_id' => $vendor->id,
            'warehouse_id' => \App\Models\Warehouse::factory()->create()->id,
            'document_number' => 'PO-001',
            'status' => 'approved',
            'date' => now(),
            'total_amount' => 1000,
        ]);

        $poItem = PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'product_id' => $product->id,
            'description' => 'Test',
            'quantity' => 10,
            'quantity_received' => 5, // Only 5 received
            'quantity_billed' => 0,
            'unit_price' => 100,
            'subtotal' => 1000,
        ]);

        // Try to bill 6 (more than received)
        $response = $this->post(route('accounting.bills.store'), [
            'purchase_order_id' => $po->id,
            'vendor_id' => $vendor->id,
            'reference_number' => 'REF-FAIL',
            'date' => now()->format('Y-m-d'),
            'items' => [
                [
                    'product_id' => $product->id,
                    'description' => 'Test Item',
                    'quantity' => 6, // > 5
                    'unit_price' => 100,
                ],
            ],
        ]);

        // Should fail (flash error)
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('vendor_bills', ['reference_number' => 'REF-FAIL']);
    }
}
