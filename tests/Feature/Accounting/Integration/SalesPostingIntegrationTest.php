<?php

namespace Tests\Feature\Accounting\Integration;

use App\Domain\Sales\Events\CustomerInvoicePosted;
use App\Models\ChartOfAccount;
use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\PostingRule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class SalesPostingIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_invoice_posted_event_triggers_automated_posting()
    {
        // 1. Setup Data
        $customer = Contact::factory()->create(['name' => 'Test Customer', 'type' => 'customer']);
        $salesAccount = ChartOfAccount::create(['code' => 'TEST-4001', 'name' => 'Sales', 'type' => 'revenue']);
        $arAccount = ChartOfAccount::create(['code' => 'TEST-1101', 'name' => 'AR', 'type' => 'asset']);

        // 2. Setup Rule
        $rule = PostingRule::create([
            'event_type' => 'sales.invoice.posted',
            'description' => 'Auto Sales Posting',
            'module' => 'Sales',
            'is_active' => true,
        ]);

        $rule->lines()->create([
            'chart_of_account_id' => $arAccount->id,
            'debit_credit' => 'debit',
            'amount_key' => 'total_amount',
            'description_template' => 'Invoice {invoice_number}',
        ]);

        $rule->lines()->create([
            'chart_of_account_id' => $salesAccount->id,
            'debit_credit' => 'credit',
            'amount_key' => 'total_amount', // Simplifying (ignoring tax for now)
            'description_template' => 'Revenue for {invoice_number}',
        ]);

        // 3. Create Invoice (Mocking the state that triggers the event)
        $invoice = CustomerInvoice::factory()->create([
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-TEST-001',
            'reference_number' => 'REF-INV-TEST-001',
            'date' => now(),
            'total_amount' => 1500.00,
        ]);

        // 4. Dispatch Event explicitly (imitating controller action)
        Event::dispatch(new CustomerInvoicePosted($invoice));

        // 5. Assert Journal Entry Created
        $this->assertDatabaseHas('journal_entries', [
            'reference_number' => 'REF-INV-TEST-001',
            'status' => 'posted',
        ]);

        $this->assertDatabaseHas('journal_entry_lines', [
            'chart_of_account_id' => $arAccount->id,
            'debit' => 1500.00,
            'description' => 'Invoice INV-TEST-001',
        ]);

        $this->assertDatabaseHas('journal_entry_lines', [
            'chart_of_account_id' => $salesAccount->id,
            'credit' => 1500.00,
            'description' => 'Revenue for INV-TEST-001',
        ]);
    }
}
