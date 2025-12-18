<?php

use App\Models\ChartOfAccount;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $accounts = [
            [
                'code' => '1401',
                'name' => 'PPN Masukan (Input VAT)',
                'type' => 'ASSET',
                'parent_code' => null,
            ],
            [
                'code' => '2202',
                'name' => 'Hutang PPh 23 (Withholding Tax Payable)',
                'type' => 'LIABILITY',
                'parent_code' => null,
            ],
        ];

        foreach ($accounts as $account) {
            ChartOfAccount::firstOrCreate(
                ['code' => $account['code']],
                $account
            );
        }
    }

    public function down(): void
    {
        ChartOfAccount::whereIn('code', ['1401', '2202'])->delete();
    }
};
