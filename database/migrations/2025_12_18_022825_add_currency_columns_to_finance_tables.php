<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'journal_entries',
            'vendor_bills',
            'vendor_payments',
            'customer_invoices',
            'customer_payments',
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->char('currency_code', 3)->default('USD')->after('id');
                $table->decimal('exchange_rate', 15, 6)->default(1.000000)->after('currency_code');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'journal_entries',
            'vendor_bills',
            'vendor_payments',
            'customer_invoices',
            'customer_payments',
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['currency_code', 'exchange_rate']);
            });
        }
    }
};
