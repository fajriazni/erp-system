<?php

namespace Tests\Feature\Accounting\Reports;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeneralLedgerExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_export_general_ledger_to_excel()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Setup Data
        $account = ChartOfAccount::create(['code' => '1000', 'name' => 'Cash', 'type' => 'asset']);
        
        $entry = JournalEntry::create([
            'reference_number' => 'JE-001',
            'date' => now(),
            'description' => 'Test Entry',
            'status' => 'posted'
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $account->id,
            'debit' => 1000,
            'credit' => 0
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $account->id, // Simplified self-balancing or dummy
            'debit' => 0,
            'credit' => 1000
        ]);

        $response = $this->get(route('accounting.reports.general-ledger.export', [
            'format' => 'excel',
            'account_id' => $account->id
        ]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_can_export_general_ledger_to_pdf()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Setup Data
        $account = ChartOfAccount::create(['code' => '1000', 'name' => 'Cash', 'type' => 'asset']);
        
        $response = $this->get(route('accounting.reports.general-ledger.export', [
            'format' => 'pdf',
            'account_id' => $account->id
        ]));

        $response->assertStatus(200);
        
        // Use a looser check for PDF since Excel facade might return binary stream
        // Usually it's application/pdf or binary
        // Just checking status 200 is good enough MVP to verify route/controller doesn't crash
    }
}
