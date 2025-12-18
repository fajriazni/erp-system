<?php

namespace Database\Seeders;

use App\Models\PaymentTerm;
use Illuminate\Database\Seeder;

class PaymentTermSeeder extends Seeder
{
    public function run()
    {
        // 1. Net 30 (Post-paid standard)
        PaymentTerm::create([
            'name' => 'Net 30',
            'description' => 'Full payment due 30 days after invoice',
            'type' => 'standard',
            'days_due' => 30,
            'is_active' => true,
        ]);

        // 2. Net 60
        PaymentTerm::create([
            'name' => 'Net 60',
            'description' => 'Full payment due 60 days after invoice',
            'type' => 'standard',
            'days_due' => 60,
            'is_active' => true,
        ]);

        // 3. 100% Advance (Pre-paid)
        PaymentTerm::create([
            'name' => '100% Advance Payment',
            'description' => 'Full payment required upon Approval',
            'type' => 'schedule',
            'schedule_definition' => [
                [
                    'percent' => 100,
                    'trigger' => 'approval', // trigger on PO approval
                    'days' => 0,
                    'description' => 'Down Payment 100%',
                ],
            ],
            'is_active' => true,
        ]);

        // 4. Termin 30/70 (Partial)
        PaymentTerm::create([
            'name' => 'Termin 30/70',
            'description' => '30% DP, 70% after delivery',
            'type' => 'schedule',
            'schedule_definition' => [
                [
                    'percent' => 30,
                    'trigger' => 'approval',
                    'days' => 7, // Due 7 days after approval
                    'description' => 'Down Payment 30%',
                ],
                [
                    'percent' => 70,
                    'trigger' => 'receipt', // trigger on goods receipt
                    'days' => 30, // Due 30 days after receipt
                    'description' => 'Final Payment 70%',
                ],
            ],
            'is_active' => true,
        ]);

        // 5. 3 Months Installment
        PaymentTerm::create([
            'name' => '3 Months Installment',
            'description' => 'Equal payments over 3 months starting from delivery',
            'type' => 'schedule',
            'schedule_definition' => [
                [
                    'percent' => 33.33,
                    'trigger' => 'receipt',
                    'days' => 0,
                    'description' => 'Installment 1',
                ],
                [
                    'percent' => 33.33,
                    'trigger' => 'receipt',
                    'days' => 30,
                    'description' => 'Installment 2',
                ],
                [
                    'percent' => 33.34, // Make sure it sums to 100
                    'trigger' => 'receipt',
                    'days' => 60,
                    'description' => 'Installment 3',
                ],
            ],
            'is_active' => true,
        ]);
    }
}
