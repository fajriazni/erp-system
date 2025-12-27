<?php

namespace Database\Seeders;

use App\Models\AccountingPeriod;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountingPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        // Create several periods for demo
        $periods = [
            [
                'name' => 'December 2024',
                'start_date' => '2024-12-01',
                'end_date' => '2024-12-31',
                'status' => 'locked',
                'locked_by' => $user->id,
                'locked_at' => now()->subDays(5),
                'lock_notes' => 'Year-end closing complete',
            ],
            [
                'name' => 'November 2024',
                'start_date' => '2024-11-01',
                'end_date' => '2024-11-30',
                'status' => 'locked',
                'locked_by' => $user->id,
                'locked_at' => now()->subDays(35),
                'lock_notes' => 'Monthly closing',
            ],
            [
                'name' => 'October 2024',
                'start_date' => '2024-10-01',
                'end_date' => '2024-10-31',
                'status' => 'locked',
                'locked_by' => $user->id,
                'locked_at' => now()->subDays(65),
            ],
            [
                'name' => 'January 2025',
                'start_date' => '2025-01-01',
                'end_date' => '2025-01-31',
                'status' => 'open',
            ],
            [
                'name' => 'February 2025',
                'start_date' => '2025-02-01',
                'end_date' => '2025-02-28',
                'status' => 'open',
            ],
            [
                'name' => 'March 2025',
                'start_date' => '2025-03-01',
                'end_date' => '2025-03-31',
                'status' => 'open',
            ],
        ];

        foreach ($periods as $periodData) {
            AccountingPeriod::create($periodData);
        }
    }
}
