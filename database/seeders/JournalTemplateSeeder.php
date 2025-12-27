<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use App\Models\JournalTemplate;
use Illuminate\Database\Seeder;

class JournalTemplateSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Setup Chart of Accounts required for templates
        $accounts = $this->setupAccounts();

        // 2. Clear existing templates to avoid duplication/mess
        JournalTemplate::query()->delete();

        // 3. Define Real-World Templates

        // --- RENT ---
        $this->createTemplate(
            'Monthly Office Rent',
            'Recurring journal for monthly office rent payment.',
            [
                ['account_id' => $accounts['rent_expense'], 'type' => 'debit', 'formula' => 'total', 'desc' => 'Monthly Rent Payment'],
                ['account_id' => $accounts['bank'], 'type' => 'credit', 'formula' => 'total', 'desc' => 'Payment via Bank Transfer'],
            ]
        );

        // --- UTILITIES ACCRUAL ---
        $this->createTemplate(
            'Utility Accrual',
            'End of month accrual for estimated utility costs.',
            [
                ['account_id' => $accounts['utilities_expense'], 'type' => 'debit', 'formula' => 'estimated_amount', 'desc' => 'Estimated Utility Expense'],
                ['account_id' => $accounts['accrued_expenses'], 'type' => 'credit', 'formula' => 'estimated_amount', 'desc' => 'Accrued Liability'],
            ]
        );

        // --- MONTHLY PAYROLL ---
        $this->createTemplate(
            'Monthly Payroll Recording',
            'Standard monthly payroll entry including tax and deductions.',
            [
                ['account_id' => $accounts['salaries_expense'], 'type' => 'debit', 'formula' => 'gross_salary', 'desc' => 'Gross Salaries'],
                ['account_id' => $accounts['tax_payable'], 'type' => 'credit', 'formula' => 'gross_salary * 0.15', 'desc' => 'Employee Income Tax (15%)'],
                ['account_id' => $accounts['bank'], 'type' => 'credit', 'formula' => 'gross_salary * 0.85', 'desc' => 'Net Salary Payment'],
            ]
        );

        // --- DEPRECIATION ---
        $this->createTemplate(
            'Monthly Depreciation - Equipment',
            'Recording monthly depreciation for office equipment.',
            [
                ['account_id' => $accounts['depreciation_expense'], 'type' => 'debit', 'formula' => 'monthly_depreciation', 'desc' => 'Depreciation Expense'],
                ['account_id' => $accounts['accumulated_depreciation'], 'type' => 'credit', 'formula' => 'monthly_depreciation', 'desc' => 'Accumulated Depreciation'],
            ]
        );

        // --- PREPAID INSURANCE ---
        $this->createTemplate(
            'Prepaid Insurance Amortization',
            'Amortization of annual insurance premium.',
            [
                ['account_id' => $accounts['insurance_expense'], 'type' => 'debit', 'formula' => 'monthly_premium', 'desc' => 'Insurance Expense'],
                ['account_id' => $accounts['prepaid_insurance'], 'type' => 'credit', 'formula' => 'monthly_premium', 'desc' => 'Reduce Prepaid Asset'],
            ]
        );

        // --- SALES INVOICE (CASH) ---
        $this->createTemplate(
            'Cash Sales Recording',
            'Recording daily cash sales with tax.',
            [
                ['account_id' => $accounts['cash'], 'type' => 'debit', 'formula' => 'total_collected', 'desc' => 'Cash Received'],
                ['account_id' => $accounts['sales_revenue'], 'type' => 'credit', 'formula' => 'total_collected / 1.11', 'desc' => 'Sales Revenue'],
                ['account_id' => $accounts['vat_out'], 'type' => 'credit', 'formula' => 'total_collected - (total_collected / 1.11)', 'desc' => 'Output VAT (11%)'],
            ]
        );

        // --- PURCHASE INVOICE (CREDIT) ---
        $this->createTemplate(
            'Inventory Purchase (Credit)',
            'Purchase of inventory on credit terms.',
            [
                ['account_id' => $accounts['inventory'], 'type' => 'debit', 'formula' => 'subtotal', 'desc' => 'Inventory Asset'],
                ['account_id' => $accounts['vat_in'], 'type' => 'debit', 'formula' => 'subtotal * 0.11', 'desc' => 'Input VAT (11%)'],
                ['account_id' => $accounts['accounts_payable'], 'type' => 'credit', 'formula' => 'subtotal * 1.11', 'desc' => 'Vendor Payable'],
            ]
        );

        // --- BANK CHARGES ---
        $this->createTemplate(
            'Monthly Bank Charges',
            'Recording monthly administrative fees.',
            [
                ['account_id' => $accounts['bank_charges'], 'type' => 'debit', 'formula' => 'total_fees', 'desc' => 'Bank Admin Fees'],
                ['account_id' => $accounts['bank'], 'type' => 'credit', 'formula' => 'total_fees', 'desc' => 'Deducted from Bank'],
            ]
        );

        // --- VAT SETTLEMENT ---
        $this->createTemplate(
            'VAT Settlement',
            'Offsetting Input VAT against Output VAT.',
            [
                ['account_id' => $accounts['vat_out'], 'type' => 'debit', 'formula' => 'output_vat_balance', 'desc' => 'Clear Output VAT'],
                ['account_id' => $accounts['vat_in'], 'type' => 'credit', 'formula' => 'input_vat_balance', 'desc' => 'Clear Input VAT'],
                ['account_id' => $accounts['bank'], 'type' => 'credit', 'formula' => 'output_vat_balance - input_vat_balance', 'desc' => 'Tax Payment'],
            ]
        );

        // --- DIVIDEND DISTRIBUTION ---
        $this->createTemplate(
            'Dividend Declaration',
            'Declaration of shareholder dividends.',
            [
                ['account_id' => $accounts['retained_earnings'], 'type' => 'debit', 'formula' => 'total_dividend', 'desc' => 'Retained Earnings'],
                ['account_id' => $accounts['dividend_payable'], 'type' => 'credit', 'formula' => 'total_dividend', 'desc' => 'Dividend Payable'],
            ]
        );
    }

    private function createTemplate(string $name, string $description, array $lines): void
    {
        $template = JournalTemplate::create([
            'name' => $name,
            'description' => $description,
            'is_active' => true,
        ]);

        foreach ($lines as $index => $line) {
            $template->lines()->create([
                'chart_of_account_id' => $line['account_id'],
                'debit_credit' => $line['type'],
                'amount_formula' => $line['formula'],
                'description' => $line['desc'],
                'sequence' => $index + 1,
            ]);
        }
    }

    private function setupAccounts(): array
    {
        return [
            'bank' => $this->getAccount('10001', 'Cash at Bank', 'asset'),
            'cash' => $this->getAccount('10002', 'Petty Cash', 'asset'),
            'rent_expense' => $this->getAccount('60001', 'Rent Expense', 'expense'),
            'utilities_expense' => $this->getAccount('60002', 'Utilities Expense', 'expense'),
            'accrued_expenses' => $this->getAccount('20002', 'Accrued Expenses', 'liability'),
            'salaries_expense' => $this->getAccount('60003', 'Salaries & Wages', 'expense'),
            'tax_payable' => $this->getAccount('20003', 'Tax Payable', 'liability'),
            'depreciation_expense' => $this->getAccount('60004', 'Depreciation Expense', 'expense'),
            'accumulated_depreciation' => $this->getAccount('10003', 'Accumulated Depreciation', 'asset'), // Simplified as asset (contra)
            'insurance_expense' => $this->getAccount('60005', 'Insurance Expense', 'expense'),
            'prepaid_insurance' => $this->getAccount('10004', 'Prepaid Insurance', 'asset'),
            'sales_revenue' => $this->getAccount('40001', 'Sales Revenue', 'revenue'),
            'vat_out' => $this->getAccount('20004', 'VAT Output', 'liability'),
            'inventory' => $this->getAccount('10005', 'Inventory', 'asset'),
            'vat_in' => $this->getAccount('10006', 'VAT Input', 'asset'),
            'accounts_payable' => $this->getAccount('20005', 'Accounts Payable', 'liability'),
            'bank_charges' => $this->getAccount('60006', 'Bank Charges', 'expense'),
            'retained_earnings' => $this->getAccount('30001', 'Retained Earnings', 'equity'),
            'dividend_payable' => $this->getAccount('20006', 'Dividend Payable', 'liability'),
        ];
    }

    private function getAccount(string $code, string $name, string $type)
    {
        return ChartOfAccount::firstOrCreate(
            ['code' => $code],
            ['name' => $name, 'type' => $type, 'is_active' => true]
        )->id;
    }
}
