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
        Schema::table('purchase_agreements', function (Blueprint $table) {
            $table->integer('renewal_reminder_days')->default(30)->after('end_date');
            $table->boolean('is_auto_renew')->default(false)->after('renewal_reminder_days');
        });

        Schema::table('blanket_orders', function (Blueprint $table) {
            $table->integer('renewal_reminder_days')->default(30)->after('end_date');
            $table->boolean('is_auto_renew')->default(false)->after('renewal_reminder_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_agreements', function (Blueprint $table) {
            $table->dropColumn(['renewal_reminder_days', 'is_auto_renew']);
        });

        Schema::table('blanket_orders', function (Blueprint $table) {
            $table->dropColumn(['renewal_reminder_days', 'is_auto_renew']);
        });
    }
};
