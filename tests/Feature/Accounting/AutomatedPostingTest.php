<?php

namespace Tests\Feature\Accounting;

use App\Domain\Accounting\Aggregates\PostingRule\PostingRule;
use App\Domain\Accounting\Aggregates\PostingRule\PostingRuleLine;
use App\Domain\Accounting\Repositories\PostingRuleRepositoryInterface;
use App\Domain\Accounting\Services\AutomatedPostingService;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\PostingRule as PostingRuleModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutomatedPostingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_it_creates_journal_entry_when_rule_matches()
    {
        // 1. Setup Accounts
        $salesAccount = ChartOfAccount::create(['code' => 'TEST-4000', 'name' => 'Sales', 'type' => 'revenue']);
        $receivableAccount = ChartOfAccount::create(['code' => 'TEST-1100', 'name' => 'AR', 'type' => 'asset']);

        // 2. Setup Rule
        // We use the Repository pattern used in Controller to ensure consistency, 
        // or just direct Model creation if Repos are overkill for this test.
        // Let's use direct Model manipulation as we are testing the Service, not the Repo.
        
        $rule = PostingRuleModel::create([
            'event_type' => 'sales.invoice.posted',
            'description' => 'Auto-post Sales Invoice',
            'module' => 'Sales',
            'is_active' => true,
        ]);

        $rule->lines()->create([
            'chart_of_account_id' => $receivableAccount->id,
            'debit_credit' => 'debit',
            'amount_key' => 'total',
            'description_template' => 'Invoice {invoice_number}',
        ]);

        $rule->lines()->create([
            'chart_of_account_id' => $salesAccount->id,
            'debit_credit' => 'credit',
            'amount_key' => 'subtotal', // Assuming tax is separate, keeping it simple
            'description_template' => 'Sales Revenue',
        ]);

        // 3. Payload
        $payload = [
            'invoice_number' => 'INV-2023-001',
            'total' => 1100.00,
            'subtotal' => 1100.00,
        ];

        // 4. Test Service
        $service = app(AutomatedPostingService::class);
        $service->handle(
            'sales.invoice.posted',
            $payload,
            'REF-INV-001',
            'Posted Invoice INV-2023-001',
            '2023-01-01'
        );

        // 5. Assertions
        $this->assertDatabaseHas('journal_entries', [
            'reference_number' => 'REF-INV-001',
            'date' => '2023-01-01 00:00:00',
            'description' => 'Posted Invoice INV-2023-001',
            'status' => 'posted',
        ]);

        $entry = JournalEntry::where('reference_number', 'REF-INV-001')->first();
        
        $this->assertCount(2, $entry->lines);
        
        $receivableLine = $entry->lines->where('chart_of_account_id', $receivableAccount->id)->first();
        $this->assertEquals(1100.00, $receivableLine->debit);
        $this->assertEquals(0, $receivableLine->credit);
        $this->assertEquals('Invoice INV-2023-001', $receivableLine->description); // Templated

        $salesLine = $entry->lines->where('chart_of_account_id', $salesAccount->id)->first();
        $this->assertEquals(0, $salesLine->debit);
        $this->assertEquals(1100.00, $salesLine->credit);
        $this->assertEquals('Sales Revenue', $salesLine->description);
    }

    public function test_it_does_nothing_if_no_rule_found()
    {
        $service = app(AutomatedPostingService::class);
        
        $service->handle(
            'unknown.event',
            [],
            'REF-UNKNOWN',
            'Should not exist',
            '2023-01-01'
        );

        $this->assertDatabaseMissing('journal_entries', [
            'reference_number' => 'REF-UNKNOWN',
        ]);
    }
}
