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
        // 1000 - ASSETS
        $assets = ChartOfAccount::updateOrCreate(['code' => '1000'], [
            'name' => 'ASSETS',
            'type' => 'asset',
            'is_active' => true,
            'description' => 'Current and non-current company assets',
        ]);

        // Current Assets (Header: 1010)
        $currentAssets = ChartOfAccount::updateOrCreate(['code' => '1010'], [
            'name' => 'Current Assets',
            'type' => 'asset',
            'parent_id' => $assets->id,
            'is_active' => true,
        ]);

        // 1100 - Cash (Keep existing code from legacy/previous seeder)
        ChartOfAccount::updateOrCreate(['code' => '1100'], [
            'name' => 'Cash and Cash Equivalents',
            'type' => 'asset',
            'parent_id' => $currentAssets->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '1120'], [
            'name' => 'Accounts Receivable',
            'type' => 'asset',
            'parent_id' => $currentAssets->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '1130'], [
            'name' => 'Inventory',
            'type' => 'asset',
            'parent_id' => $currentAssets->id,
            'is_active' => true,
        ]);

        // 1400 - Inventory (COGS Automation Account)
        ChartOfAccount::updateOrCreate(['code' => '1400'], [
            'name' => 'Inventory (COGS)',
            'type' => 'asset',
            'parent_id' => $currentAssets->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '1401'], [
            'name' => 'PPN Masukan (Input VAT)',
            'type' => 'asset',
            'parent_id' => $currentAssets->id,
            'is_active' => true,
        ]);

        // Non-Current Assets (Header: 1200)
        $nonCurrentAssets = ChartOfAccount::updateOrCreate(['code' => '1200'], [
            'name' => 'Non-Current Assets',
            'type' => 'asset',
            'parent_id' => $assets->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '1210'], [
            'name' => 'Property, Plant and Equipment',
            'type' => 'asset',
            'parent_id' => $nonCurrentAssets->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '1220'], [
            'name' => 'Accumulated Depreciation',
            'type' => 'asset',
            'parent_id' => $nonCurrentAssets->id,
            'is_active' => true,
        ]);

        // 2000 - LIABILITIES
        $liabilities = ChartOfAccount::updateOrCreate(['code' => '2000'], [
            'name' => 'LIABILITIES',
            'type' => 'liability',
            'is_active' => true,
            'description' => 'Current and non-current liabilities',
        ]);

        // Current Liabilities (Header: 2010)
        $currentLiabilities = ChartOfAccount::updateOrCreate(['code' => '2010'], [
            'name' => 'Current Liabilities',
            'type' => 'liability',
            'parent_id' => $liabilities->id,
            'is_active' => true,
        ]);

        // 2100 - Accounts Payable (Keep existing code)
        ChartOfAccount::updateOrCreate(['code' => '2100'], [
            'name' => 'Accounts Payable',
            'type' => 'liability',
            'parent_id' => $currentLiabilities->id,
            'is_active' => true,
        ]);

        // 2110 - Unbilled Payables (Keep existing code)
        ChartOfAccount::updateOrCreate(['code' => '2110'], [
            'name' => 'Unbilled Payables',
            'type' => 'liability',
            'parent_id' => $currentLiabilities->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '2130'], [
            'name' => 'Taxes Payable',
            'type' => 'liability',
            'parent_id' => $currentLiabilities->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '2202'], [
            'name' => 'Hutang PPh 23 (WHT Payable)',
            'type' => 'liability',
            'parent_id' => $currentLiabilities->id,
            'is_active' => true,
        ]);

        // 3000 - EQUITY
        $equity = ChartOfAccount::updateOrCreate(['code' => '3000'], [
            'name' => 'EQUITY',
            'type' => 'equity',
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '3110'], [
            'name' => 'Share Capital',
            'type' => 'equity',
            'parent_id' => $equity->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '3120'], [
            'name' => 'Retained Earnings',
            'type' => 'equity',
            'parent_id' => $equity->id,
            'is_active' => true,
        ]);

        // 4000 - REVENUE
        $revenue = ChartOfAccount::updateOrCreate(['code' => '4000'], [
            'name' => 'REVENUE',
            'type' => 'revenue',
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '4110'], [
            'name' => 'Sales Revenue',
            'type' => 'revenue',
            'parent_id' => $revenue->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '4120'], [
            'name' => 'Service Revenue',
            'type' => 'revenue',
            'parent_id' => $revenue->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '4200'], [
            'name' => 'Sales Returns and Allowances',
            'type' => 'revenue',
            'parent_id' => $revenue->id,
            'is_active' => true,
        ]);

        // 5000 - COGS
        $cogs = ChartOfAccount::updateOrCreate(['code' => '5000'], [
            'name' => 'COST OF GOODS SOLD',
            'type' => 'expense',
            'is_active' => true,
        ]);

        // 5100 - COGS (COGS Automation Account)
        ChartOfAccount::updateOrCreate(['code' => '5100'], [
            'name' => 'Cost of Goods Sold',
            'type' => 'expense',
            'parent_id' => $cogs->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '5110'], [
            'name' => 'COGS - Products',
            'type' => 'expense',
            'parent_id' => $cogs->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '5200'], [
            'name' => 'Purchase Returns and Allowances',
            'type' => 'expense',
            'parent_id' => $cogs->id,
            'is_active' => true,
        ]);

        // 6000 - OPERATING EXPENSES
        $opex = ChartOfAccount::updateOrCreate(['code' => '6000'], [
            'name' => 'OPERATING EXPENSES',
            'type' => 'expense',
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '6110'], [
            'name' => 'Salaries and Wages',
            'type' => 'expense',
            'parent_id' => $opex->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '6120'], [
            'name' => 'Rent Expense',
            'type' => 'expense',
            'parent_id' => $opex->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '6130'], [
            'name' => 'Utilities (Electricity & Water)',
            'type' => 'expense',
            'parent_id' => $opex->id,
            'is_active' => true,
        ]);

        ChartOfAccount::updateOrCreate(['code' => '6170'], [
            'name' => 'Depreciation Expense',
            'type' => 'expense',
            'parent_id' => $opex->id,
            'is_active' => true,
        ]);

        // 6200 - Loss on Disposal (COGS Automation Account for Scrap)
        ChartOfAccount::updateOrCreate(['code' => '6200'], [
            'name' => 'Loss on Disposal',
            'type' => 'expense',
            'parent_id' => $opex->id,
            'is_active' => true,
        ]);
    }
}
