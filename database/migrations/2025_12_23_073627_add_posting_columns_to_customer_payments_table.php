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
        Schema::table('customer_payments', function (Blueprint $table) {
            $table->string('status')->default('draft')->after('notes');
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->nullOnDelete()->after('status');
            $table->datetime('posted_at')->nullable()->after('journal_entry_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_payments', function (Blueprint $table) {
            $table->dropForeign(['journal_entry_id']);
            $table->dropColumn(['status', 'journal_entry_id', 'posted_at']);
        });
    }
};
