<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChartOfAccount;
use App\Application\Services\Accounting\DeferredScheduleService;

class DeferredScheduleSeeder extends Seeder
{
    public function run()
    {
        $prepaid = ChartOfAccount::firstOrCreate(
            ['code' => '1150'],
            ['name' => 'Prepaid Expenses', 'type' => 'asset', 'is_active' => true]
        );

        $unearned = ChartOfAccount::firstOrCreate(
            ['code' => '2140'],
            ['name' => 'Unearned Revenue', 'type' => 'liability', 'is_active' => true]
        );

        $rentExpense = ChartOfAccount::where('name', 'Rent Expense')->first() 
            ?? ChartOfAccount::firstOrCreate(['code' => '6120'], ['name' => 'Rent Expense', 'type' => 'expense']);
            
        $serviceRevenue = ChartOfAccount::where('name', 'Service Revenue')->first()
            ?? ChartOfAccount::firstOrCreate(['code' => '4120'], ['name' => 'Service Revenue', 'type' => 'revenue']);

        $service = new DeferredScheduleService();

        // 1. Prepaid Rent
        try {
            $service->createSchedule([
                'code' => 'DEF-2024-001',
                'name' => 'Office Rent 2024',
                'type' => 'expense',
                'total_amount' => 120000000,
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'deferred_account_id' => $prepaid->id,
                'recognition_account_id' => $rentExpense->id,
                'description' => 'Annual Office Rent seeded',
            ]);
            $this->command->info('Created Prepaid Rent schedule');
        } catch (\Exception $e) {
            $this->command->info('Skipped Prepaid Rent (Duplicate?)');
        }

        // 2. Unearned Revenue
        try {
            $service->createSchedule([
                'code' => 'DEF-2024-002',
                'name' => 'Annual Support Contract - PT ABC',
                'type' => 'revenue',
                'total_amount' => 60000000,
                'start_date' => '2024-06-01',
                'end_date' => '2025-05-31',
                'deferred_account_id' => $unearned->id,
                'recognition_account_id' => $serviceRevenue->id,
                'description' => 'Customer annual prepayment seeded',
            ]);
            $this->command->info('Created Unearned Revenue schedule');
        } catch (\Exception $e) {
             $this->command->info('Skipped Unearned Revenue (Duplicate?)');
        }
    }
}
