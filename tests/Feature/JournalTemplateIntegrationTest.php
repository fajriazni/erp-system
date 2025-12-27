<?php

namespace Tests\Feature;

use App\Models\ChartOfAccount;
use App\Models\JournalTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalTemplateIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_journal_entry_create_page_has_templates()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Create accounts
        $account1 = ChartOfAccount::create(['code' => '1001', 'name' => 'Cash', 'type' => 'ASSET']);
        $account2 = ChartOfAccount::create(['code' => '4001', 'name' => 'Revenue', 'type' => 'REVENUE']);

        // Create a template
        $template = JournalTemplate::create(['name' => 'Monthly Sales', 'description' => 'Recurring sales']);
        $template->lines()->create(['chart_of_account_id' => $account1->id, 'debit_credit' => 'debit', 'description' => 'Cash in']);
        $template->lines()->create(['chart_of_account_id' => $account2->id, 'debit_credit' => 'credit', 'description' => 'Sales out']);

        $response = $this->get(route('accounting.journal-entries.create'));

        $response->assertStatus(200);

        // Assert templates are passed to the view
        $response->assertInertia(fn ($page) => $page
            ->component('Accounting/JournalEntries/Create')
            ->has('journalTemplates', 1)
            ->where('journalTemplates.0.name', 'Monthly Sales')
            ->where('journalTemplates.0.lines.0.chart_of_account_id', $account1->id)
        );
    }
}
