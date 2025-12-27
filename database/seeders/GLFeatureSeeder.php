<?php

namespace Database\Seeders;

use App\Application\Commands\SetBeginningBalanceService;
use App\Models\AccountingPeriod;
use App\Models\ChartOfAccount;
use App\Models\PostingRule;
use App\Models\PostingRuleLine;
use Illuminate\Database\Seeder;

class GLFeatureSeeder extends Seeder
{
    public function __construct(
        private readonly SetBeginningBalanceService $beginningBalanceService
    ) {}

    public function run(): void
    {
        $this->seedPostingRules();
        $this->seedBeginningBalances();
    }

    private function seedPostingRules(): void
    {
        // 1. Sales Invoice Rule
        $salesRule = PostingRule::updateOrCreate(
            ['event_type' => 'customer.invoice.posted'],
            [
                'description' => 'Automated entry for customer invoices',
                'module' => 'Sales',
                'is_active' => true,
            ]
        );

        // Delete existing lines for this rule
        PostingRuleLine::where('posting_rule_id', $salesRule->id)->delete();

        $arAccount = ChartOfAccount::where('code', '1120')->first();
        $salesAccount = ChartOfAccount::where('code', '4110')->first();
        $taxAccount = ChartOfAccount::where('code', '2130')->first();

        PostingRuleLine::create([
            'posting_rule_id' => $salesRule->id,
            'chart_of_account_id' => $arAccount->id,
            'debit_credit' => 'debit',
            'amount_key' => 'total_amount',
            'description_template' => 'Piutang Invoice {invoice_number}',
        ]);

        PostingRuleLine::create([
            'posting_rule_id' => $salesRule->id,
            'chart_of_account_id' => $salesAccount->id,
            'debit_credit' => 'credit',
            'amount_key' => 'subtotal',
            'description_template' => 'Pendapatan Penjualan {invoice_number}',
        ]);

        PostingRuleLine::create([
            'posting_rule_id' => $salesRule->id,
            'chart_of_account_id' => $taxAccount->id,
            'debit_credit' => 'credit',
            'amount_key' => 'tax_amount',
            'description_template' => 'PPN atas Invoice {invoice_number}',
        ]);

        // 2. Goods Receipt Rule
        $purchaseRule = PostingRule::updateOrCreate(
            ['event_type' => 'goods.receipt.posted'],
            [
                'description' => 'Automated entry for goods receipt (GR/IR)',
                'module' => 'Purchasing',
                'is_active' => true,
            ]
        );

        // Delete existing lines for this rule
        PostingRuleLine::where('posting_rule_id', $purchaseRule->id)->delete();

        $inventoryAccount = ChartOfAccount::where('code', '1130')->first();
        $unbilledAccount = ChartOfAccount::where('code', '2110')->first();

        PostingRuleLine::create([
            'posting_rule_id' => $purchaseRule->id,
            'chart_of_account_id' => $inventoryAccount->id,
            'debit_credit' => 'debit',
            'amount_key' => 'total_amount',
            'description_template' => 'Penerimaan Barang {receipt_number}',
        ]);

        PostingRuleLine::create([
            'posting_rule_id' => $purchaseRule->id,
            'chart_of_account_id' => $unbilledAccount->id,
            'debit_credit' => 'credit',
            'amount_key' => 'total_amount',
            'description_template' => 'Hutang Belum Difakturkan {receipt_number}',
        ]);
    }

    private function seedBeginningBalances(): void
    {
        $period = AccountingPeriod::where('status', 'open')->first();
        if (! $period) {
            return;
        }

        $cashAccount = ChartOfAccount::where('code', '1100')->first();
        $capitalAccount = ChartOfAccount::where('code', '3110')->first();

        if ($cashAccount && $capitalAccount) {
            $this->beginningBalanceService->execute(
                $period->start_date->format('Y-m-d'),
                [
                    ['chart_of_account_id' => $cashAccount->id, 'amount' => 50000000, 'type' => 'debit'],
                    ['chart_of_account_id' => $capitalAccount->id, 'amount' => 50000000, 'type' => 'credit'],
                ]
            );
        }
    }
}
