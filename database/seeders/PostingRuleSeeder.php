<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use App\Models\PostingRule;
use Illuminate\Database\Seeder;

class PostingRuleSeeder extends Seeder
{
    public function run(): void
    {
        // Get common accounts (adjust IDs based on your chart of accounts)
        $cashAccount = ChartOfAccount::where('code', '1101')->first();
        $arAccount = ChartOfAccount::where('code', '1201')->first();
        $apAccount = ChartOfAccount::where('code', '2101')->first();
        $inventoryAccount = ChartOfAccount::where('code', '1301')->first();
        $revenueAccount = ChartOfAccount::where('code', '4101')->first();
        $cogsAccount = ChartOfAccount::where('code', '5101')->first();
        $expenseAccount = ChartOfAccount::where('code', '5201')->first();
        $taxPayableAccount = ChartOfAccount::where('code', '2301')->first();
        $taxReceivableAccount = ChartOfAccount::where('code', '1401')->first();

        // 1. Sales Invoice Posted
        $rule1 = PostingRule::updateOrCreate(
            ['event_type' => 'sales.invoice.posted'],
            [
                'description' => 'Journal entry when a sales invoice is posted',
                'module' => 'Sales',
                'is_active' => true,
            ]
        );
        $rule1->lines()->delete();
        $rule1->lines()->createMany([
            [
                'chart_of_account_id' => $arAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'total_amount',
                'description_template' => 'Invoice {invoice_number} - {customer_name}',
            ],
            [
                'chart_of_account_id' => $revenueAccount?->id ?? 2,
                'debit_credit' => 'credit',
                'amount_key' => 'subtotal',
                'description_template' => 'Sales Revenue - Invoice {invoice_number}',
            ],
            [
                'chart_of_account_id' => $taxPayableAccount?->id ?? 3,
                'debit_credit' => 'credit',
                'amount_key' => 'tax_amount',
                'description_template' => 'PPN - Invoice {invoice_number}',
            ],
        ]);

        // 2. Customer Payment Received
        $rule2 = PostingRule::updateOrCreate(
            ['event_type' => 'sales.payment.received'],
            [
                'description' => 'Journal entry when customer payment is received',
                'module' => 'Sales',
                'is_active' => true,
            ]
        );
        $rule2->lines()->delete();
        $rule2->lines()->createMany([
            [
                'chart_of_account_id' => $cashAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'amount',
                'description_template' => 'Payment {payment_number} from {customer_name}',
            ],
            [
                'chart_of_account_id' => $arAccount?->id ?? 2,
                'debit_credit' => 'credit',
                'amount_key' => 'amount',
                'description_template' => 'Payment received - {payment_number}',
            ],
        ]);

        // 3. Vendor Bill Posted
        $rule3 = PostingRule::updateOrCreate(
            ['event_type' => 'purchasing.bill.posted'],
            [
                'description' => 'Journal entry when a vendor bill is posted',
                'module' => 'Purchasing',
                'is_active' => true,
            ]
        );
        $rule3->lines()->delete();
        $rule3->lines()->createMany([
            [
                'chart_of_account_id' => $expenseAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'subtotal',
                'description_template' => 'Bill {bill_number} - {vendor_name}',
            ],
            [
                'chart_of_account_id' => $taxReceivableAccount?->id ?? 2,
                'debit_credit' => 'debit',
                'amount_key' => 'tax_amount',
                'description_template' => 'PPN Masukan - Bill {bill_number}',
            ],
            [
                'chart_of_account_id' => $apAccount?->id ?? 3,
                'debit_credit' => 'credit',
                'amount_key' => 'total_amount',
                'description_template' => 'Accounts Payable - {vendor_name}',
            ],
        ]);

        // 4. Vendor Payment Made
        $rule4 = PostingRule::updateOrCreate(
            ['event_type' => 'purchasing.payment.made'],
            [
                'description' => 'Journal entry when vendor payment is made',
                'module' => 'Purchasing',
                'is_active' => true,
            ]
        );
        $rule4->lines()->delete();
        $rule4->lines()->createMany([
            [
                'chart_of_account_id' => $apAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'amount',
                'description_template' => 'Payment to {vendor_name}',
            ],
            [
                'chart_of_account_id' => $cashAccount?->id ?? 2,
                'debit_credit' => 'credit',
                'amount_key' => 'amount',
                'description_template' => 'Payment {payment_number}',
            ],
        ]);

        // 5. Goods Receipt (Inventory In)
        $rule5 = PostingRule::updateOrCreate(
            ['event_type' => 'inventory.goods_receipt.posted'],
            [
                'description' => 'Journal entry when goods are received into inventory',
                'module' => 'Inventory',
                'is_active' => true,
            ]
        );
        $rule5->lines()->delete();
        $rule5->lines()->createMany([
            [
                'chart_of_account_id' => $inventoryAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'total_cost',
                'description_template' => 'Goods Receipt {receipt_number}',
            ],
            [
                'chart_of_account_id' => $apAccount?->id ?? 2,
                'debit_credit' => 'credit',
                'amount_key' => 'total_cost',
                'description_template' => 'GR {receipt_number} - {vendor_name}',
            ],
        ]);

        // 6. Goods Issue (Inventory Out)
        $rule6 = PostingRule::updateOrCreate(
            ['event_type' => 'inventory.goods_issue.posted'],
            [
                'description' => 'Journal entry when goods are issued from inventory (COGS)',
                'module' => 'Inventory',
                'is_active' => true,
            ]
        );
        $rule6->lines()->delete();
        $rule6->lines()->createMany([
            [
                'chart_of_account_id' => $cogsAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'total_cost',
                'description_template' => 'COGS - Issue {issue_number}',
            ],
            [
                'chart_of_account_id' => $inventoryAccount?->id ?? 2,
                'debit_credit' => 'credit',
                'amount_key' => 'total_cost',
                'description_template' => 'Goods Issue {issue_number}',
            ],
        ]);

        // 7. Sales Return (Credit Note)
        $rule7 = PostingRule::updateOrCreate(
            ['event_type' => 'sales.credit_note.posted'],
            [
                'description' => 'Journal entry for sales returns',
                'module' => 'Sales',
                'is_active' => true,
            ]
        );
        $rule7->lines()->delete();
        $rule7->lines()->createMany([
            [
                'chart_of_account_id' => $revenueAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'amount',
                'description_template' => 'Sales Return - CN {note_number}',
            ],
            [
                'chart_of_account_id' => $arAccount?->id ?? 2,
                'debit_credit' => 'credit',
                'amount_key' => 'amount',
                'description_template' => 'Credit Note {note_number}',
            ],
        ]);

        // 8. Purchase Return (Debit Note)
        $rule8 = PostingRule::updateOrCreate(
            ['event_type' => 'purchasing.debit_note.posted'],
            [
                'description' => 'Journal entry for purchase returns',
                'module' => 'Purchasing',
                'is_active' => true,
            ]
        );
        $rule8->lines()->delete();
        $rule8->lines()->createMany([
            [
                'chart_of_account_id' => $apAccount?->id ?? 1,
                'debit_credit' => 'debit',
                'amount_key' => 'amount',
                'description_template' => 'Purchase Return - DN {note_number}',
            ],
            [
                'chart_of_account_id' => $expenseAccount?->id ?? 2,
                'debit_credit' => 'credit',
                'amount_key' => 'amount',
                'description_template' => 'Debit Note {note_number}',
            ],
        ]);

        $this->command->info('Created 8 posting rules for Sales, Purchasing, and Inventory modules');
    }
}
