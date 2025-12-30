<?php

namespace Tests\Feature\Integration;

use App\Domain\Accounting\Services\JournalEntryService;
use App\Domain\Finance\Services\BankService;
use App\Domain\Finance\Services\ExpenseService;
use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Models\Department;
use App\Models\ExpenseClaim;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceAccountingIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed COAs
        $this->assetAccount = ChartOfAccount::create(['code' => '1000', 'name' => 'Bank BCA', 'type' => 'asset']);
        $this->expenseAccount = ChartOfAccount::create(['code' => '6000', 'name' => 'General Expense', 'type' => 'expense']);
        $this->equityAccount = ChartOfAccount::create(['code' => '3000', 'name' => 'Owner Equity', 'type' => 'equity']);
    }

    public function test_fund_transfer_creates_journal_entry()
    {
        // 1. Setup Accounts
        $bank1 = BankAccount::create([
            'name' => 'Bank One', 
            'bank_name' => 'BCA', // Added bank_name
            'account_number' => '111', 
            'currency' => 'IDR', 
            'chart_of_account_id' => $this->assetAccount->id,
            'current_balance' => 1000000
        ]);
        
        // Need a second COA for the second bank to see distinct entries, or same is fine.
        $assetAccount2 = ChartOfAccount::create(['code' => '1001', 'name' => 'Bank Mandiri', 'type' => 'asset']);
        $bank2 = BankAccount::create([
            'name' => 'Bank Two', 
            'bank_name' => 'Mandiri', // Added bank_name
            'account_number' => '222', 
            'currency' => 'IDR', 
            'chart_of_account_id' => $assetAccount2->id,
            'current_balance' => 0
        ]);

        // 2. Perform Transfer
        $service = app(BankService::class); // Resolutions should work if registered or auto-wired
        // Note: BankService needs JournalEntryService. Auto-wiring handles this.
        
        $service->transfer($bank1, $bank2, 500000, 'Test Transfer');

        // 3. Verify Journal Entry
        $this->assertDatabaseHas('journal_entries', [
            'description' => 'Fund Transfer: Bank One to Bank Two',
            'status' => 'posted'
        ]);

        $entry = \App\Models\JournalEntry::latest()->first();
        
        // Verify Lines
        // Credit Bank 1 (Asset Decrease)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $this->assetAccount->id,
            'credit' => 500000,
            'debit' => 0
        ]);
        
        // Debit Bank 2 (Asset Increase)
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $assetAccount2->id,
            'credit' => 0,
            'debit' => 500000
        ]);
    }

    public function test_expense_payment_creates_journal_entry()
    {
        // 1. Setup
        $user = User::factory()->create();
        $bank = BankAccount::create([
            'name' => 'Main Bank', 
            'bank_name' => 'BCA', // Added bank_name
            'account_number' => '999', 
            'currency' => 'IDR', 
            'chart_of_account_id' => $this->assetAccount->id,
            'current_balance' => 1000000
        ]);
        
        $dept = Department::create(['name' => 'IT', 'code' => 'IT']);

        $claim = ExpenseClaim::create([
            'user_id' => $user->id,
            'department_id' => $dept->id,
            'title' => 'Server Costs',
            'total_amount' => 100000,
            'status' => 'approved' // Ready to pay
        ]);
        $claim->items()->create(['date' => now(), 'category' => 'Tech', 'description' => 'AWS', 'amount' => 100000]);

        // 2. Pay
        $service = app(ExpenseService::class); // Auto-wired
        $service->pay($claim, $bank);

        // 3. Verify
        $this->assertEquals('paid', $claim->refresh()->status);
        $this->assertEquals(900000, $bank->refresh()->current_balance);

        // Verify Journal Entry
        $this->assertDatabaseHas('journal_entries', [
            'description' => 'Expense Payment: Server Costs',
            'status' => 'posted'
        ]);

        $entry = \App\Models\JournalEntry::where('description', 'Expense Payment: Server Costs')->first();

        // Debit Expense
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $this->expenseAccount->id,
            'debit' => 100000,
            'credit' => 0
        ]);
        
        // Credit Bank
        $this->assertDatabaseHas('journal_entry_lines', [
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $this->assetAccount->id,
            'debit' => 0,
            'credit' => 100000
        ]);
    }
}
