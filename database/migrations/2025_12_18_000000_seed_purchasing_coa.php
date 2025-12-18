<?php

use App\Models\ChartOfAccount;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $accounts = [
            [
                'code' => '1100',
                'name' => 'Cash',
                'type' => 'ASSET',
                'is_active' => true,
            ],
            [
                'code' => '2100',
                'name' => 'Accounts Payable',
                'type' => 'LIABILITY',
                'is_active' => true,
            ],
            [
                'code' => '2110',
                'name' => 'Unbilled Payables',
                'type' => 'LIABILITY', // GR/IR Clearing Account
                'is_active' => true,
            ],
        ];

        foreach ($accounts as $account) {
            if (! ChartOfAccount::where('code', $account['code'])->exists()) {
                ChartOfAccount::create($account);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't delete on rollback to preserve data integrity if used
    }
};
