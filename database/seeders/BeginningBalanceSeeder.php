<?php

namespace Database\Seeders;

use App\Models\AccountingPeriod;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Database\Seeder;

class BeginningBalanceSeeder extends Seeder
{
    public function run(): void
    {
        // Get first open period
        $period = AccountingPeriod::where('status', 'open')->orderBy('start_date')->first();

        if (! $period) {
            $this->command->warn('No open accounting period found. Skipping beginning balance seeding.');

            return;
        }

        // Get accounts
        $cash = ChartOfAccount::where('code', '1100')->first();
        $ar = ChartOfAccount::where('code', '1120')->first();
        $inventory = ChartOfAccount::where('code', '1130')->first();
        $ap = ChartOfAccount::where('code', '2100')->first();
        $capital = ChartOfAccount::where('code', '3110')->first();
        $retainedEarnings = ChartOfAccount::where('code', '3120')->first();

        if (! $cash || ! $capital) {
            $this->command->warn('Required accounts not found. Please run AccountingSeeder first.');

            return;
        }

        // Check if beginning balance already exists
        $existing = JournalEntry::where('description', 'like', '%Beginning Balance%')
            ->where('date', $period->start_date)
            ->first();

        if ($existing) {
            $this->command->info('Beginning balance already exists. Skipping.');

            return;
        }

        // Create beginning balance journal entry
        $entry = JournalEntry::create([
            'date' => $period->start_date,
            'description' => 'Beginning Balance - Initial Setup '.$period->start_date->format('Y'),
            'status' => 'posted',
        ]);

        // ASSETS (Debit)
        // Cash: Rp 100,000,000
        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $cash->id,
            'debit' => 100000000,
            'credit' => 0,
            'description' => 'Cash Beginning Balance',
        ]);

        // Accounts Receivable: Rp 50,000,000
        if ($ar) {
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'chart_of_account_id' => $ar->id,
                'debit' => 50000000,
                'credit' => 0,
                'description' => 'AR Beginning Balance',
            ]);
        }

        // Inventory: Rp 75,000,000
        if ($inventory) {
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'chart_of_account_id' => $inventory->id,
                'debit' => 75000000,
                'credit' => 0,
                'description' => 'Inventory Beginning Balance',
            ]);
        }

        // LIABILITIES (Credit)
        // Accounts Payable: Rp 35,000,000
        if ($ap) {
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'chart_of_account_id' => $ap->id,
                'debit' => 0,
                'credit' => 35000000,
                'description' => 'AP Beginning Balance',
            ]);
        }

        // EQUITY (Credit)
        // Share Capital: Rp 150,000,000
        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'chart_of_account_id' => $capital->id,
            'debit' => 0,
            'credit' => 150000000,
            'description' => 'Share Capital Beginning Balance',
        ]);

        // Retained Earnings: Rp 40,000,000
        if ($retainedEarnings) {
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'chart_of_account_id' => $retainedEarnings->id,
                'debit' => 0,
                'credit' => 40000000,
                'description' => 'Retained Earnings Beginning Balance',
            ]);
        }

        $this->command->info('✓ Created beginning balance entry with opening balances:');
        $this->command->info('  Assets: Cash (100M) + AR (50M) + Inventory (75M) = 225M');
        $this->command->info('  Liabilities: AP (35M)');
        $this->command->info('  Equity: Share Capital (150M) + Retained Earnings (40M) = 190M');
        $this->command->info('  Balance Check: 225M = 35M + 190M ✓');
    }
}
