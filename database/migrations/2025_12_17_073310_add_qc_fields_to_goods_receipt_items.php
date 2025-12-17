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
        Schema::table('goods_receipt_items', function (Blueprint $table) {
            $table->enum('qc_status', ['pending', 'in_qa', 'passed', 'failed', 'partial'])->default('pending')->after('landed_cost_total');
            $table->integer('qc_passed_qty')->default(0)->after('qc_status');
            $table->integer('qc_failed_qty')->default(0)->after('qc_passed_qty');
            $table->text('qc_notes')->nullable()->after('qc_failed_qty');
            $table->foreignId('qc_by')->nullable()->constrained('users')->after('qc_notes');
            $table->timestamp('qc_at')->nullable()->after('qc_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goods_receipt_items', function (Blueprint $table) {
            $table->dropForeign(['qc_by']);
            $table->dropColumn(['qc_status', 'qc_passed_qty', 'qc_failed_qty', 'qc_notes', 'qc_by', 'qc_at']);
        });
    }
};
