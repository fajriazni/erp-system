<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use Illuminate\Database\Seeder;

class AccountingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assets
        ChartOfAccount::firstOrCreate(['code' => '1100'], [
            'name' => 'Cash',
            'type' => 'ASSET',
            'is_active' => true,
        ]);

        ChartOfAccount::firstOrCreate(['code' => '1200'], [
            'name' => 'Accounts Receivable',
            'type' => 'ASSET',
            'is_active' => true,
        ]);

        ChartOfAccount::firstOrCreate(['code' => '1400'], [
            'name' => 'Inventory Asset',
            'type' => 'ASSET',
            'is_active' => true,
        ]);

        // Liabilities
        ChartOfAccount::firstOrCreate(['code' => '2100'], [
            'name' => 'Accounts Payable',
            'type' => 'LIABILITY',
            'is_active' => true,
        ]);

        ChartOfAccount::firstOrCreate(['code' => '2110'], [
            'name' => 'Unbilled Payables',
            'type' => 'LIABILITY',
            'is_active' => true,
        ]);

        // Equity
        ChartOfAccount::firstOrCreate(['code' => '3100'], [
            'name' => 'Owner Equity',
            'type' => 'EQUITY',
            'is_active' => true,
        ]);

        // Revenue
        ChartOfAccount::firstOrCreate(['code' => '4100'], [
            'name' => 'Sales Revenue',
            'type' => 'REVENUE',
            'is_active' => true,
        ]);

        // Expenses
        ChartOfAccount::firstOrCreate(['code' => '5100'], [
            'name' => 'Cost of Goods Sold',
            'type' => 'EXPENSE',
            'is_active' => true,
        ]);

        ChartOfAccount::firstOrCreate(['code' => '5200'], [
            'name' => 'General Expenses',
            'type' => 'EXPENSE',
            'is_active' => true,
        ]);
    }
}
