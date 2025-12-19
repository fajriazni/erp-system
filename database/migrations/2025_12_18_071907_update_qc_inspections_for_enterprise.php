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
        Schema::table('qc_inspections', function (Blueprint $table) {
            // Drop foreign key if exists (might vary by DB driver, generic approach)
            // For sqlite/testing we often just ignore, but for production we should drop
            $table->dropForeign(['goods_receipt_item_id']);
            $table->dropIndex(['goods_receipt_item_id']);
            $table->dropColumn('goods_receipt_item_id');

            // Polymorphic relation
            $table->nullableMorphs('inspectable');

            $table->string('reference_number')->nullable()->unique()->after('id');
            $table->string('status')->default('pending')->after('failed_qty'); // pending, passed, failed, conditional
            
            // Add quantity_inspected for partial checking
            $table->integer('quantity_inspected')->default(0)->after('inspector_id');
        });
    }

    public function down(): void
    {
        Schema::table('qc_inspections', function (Blueprint $table) {
            $table->dropMorphs('inspectable');
            $table->dropColumn(['reference_number', 'status', 'quantity_inspected']);
            
            // Restore original (simplified)
            $table->foreignId('goods_receipt_item_id')->nullable()->constrained()->cascadeOnDelete();
        });
    }
};
