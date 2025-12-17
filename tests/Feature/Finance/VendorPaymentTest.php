<?php

namespace Tests\Feature\Finance;

use App\Domain\Finance\Services\CreateVendorPaymentService;
use App\Models\Contact;
use App\Models\JournalEntry;
use App\Models\VendorBill;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AccountingSeeder::class);
    }

    public function test_full_payment_completes_bill_and_creates_journal()
    {
        // 1. Setup Data
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $bill = VendorBill::create([
            'vendor_id' => $vendor->id,
            'bill_number' => 'BILL-001',
            'date' => now(),
            'due_date' => now(),
            'status' => 'posted',
            'total_amount' => 100000,
        ]);

        $service = app(CreateVendorPaymentService::class);

        // 2. Execute Payment
        $paymentData = [
            'payment_number' => 'PAY-001',
            'vendor_id' => $vendor->id,
            'date' => now()->format('Y-m-d'),
            'amount' => 100000,
            'allocations' => [
                ['bill_id' => $bill->id, 'amount' => 100000],
            ],
            // Defaulting cash account
        ];

        $payment = $service->execute($paymentData);

        // 3. Assertions
        // Bill Status
        $this->assertEquals('paid', $bill->fresh()->status);
        $this->assertEquals(100000, $bill->fresh()->amount_paid);
        $this->assertEquals(0, $bill->fresh()->balance_due);

        // Journal Entry
        $this->assertDatabaseHas('journal_entries', [
            'reference_number' => 'PAY-001',
        ]);

        $journalEntry = JournalEntry::where('reference_number', 'PAY-001')->first();

        // Debit AP (2100)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '2100')->first()->id,
            'debit' => 100000,
            'credit' => 0,
        ]);

        // Credit Cash (1100)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $journalEntry->id,
            'chart_of_account_id' => \App\Models\ChartOfAccount::where('code', '1100')->first()->id,
            'debit' => 0,
            'credit' => 100000,
        ]);
    }

    public function test_partial_payment_updates_status_to_partial()
    {
        // 1. Setup
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $bill = VendorBill::create([
            'vendor_id' => $vendor->id,
            'bill_number' => 'BILL-002',
            'date' => now(),
            'due_date' => now(),
            'status' => 'posted',
            'total_amount' => 100000,
        ]);

        $service = app(CreateVendorPaymentService::class);

        // 2. Execute Partial Payment
        $service->execute([
            'payment_number' => 'PAY-002',
            'vendor_id' => $vendor->id,
            'date' => now()->format('Y-m-d'),
            'amount' => 50000,
            'allocations' => [
                ['bill_id' => $bill->id, 'amount' => 50000],
            ],
        ]);

        // 3. Assertions
        $this->assertEquals('partial', $bill->fresh()->status);
        $this->assertEquals(50000, $bill->fresh()->amount_paid);
        $this->assertEquals(50000, $bill->fresh()->balance_due);
    }
}
