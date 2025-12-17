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
        // Align 'purchase_rfqs'
        Schema::table('purchase_rfqs', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_rfqs', 'notes')) {
                $table->text('notes')->nullable();
            }
            if (!Schema::hasColumn('purchase_rfqs', 'created_by')) {
                // Assuming user_id exists, we can stick with it or rename.
                // Let's stick with user_id as 'created_by' alias for now to minimize disruption, 
                // or just add created_by if needed. Let's add created_by as FK.
                $table->foreignId('created_by')->nullable()->constrained('users');
            }
        });

        // Align 'purchase_rfq_lines'
        Schema::table('purchase_rfq_lines', function (Blueprint $table) {
            // Add uom_id derived from products if possible, or just nullable for now
             if (!Schema::hasColumn('purchase_rfq_lines', 'uom_id')) {
                $table->foreignId('uom_id')->nullable()->constrained('uoms');
            }
            // We can drop 'uom' string column later if needed, but keeping it safe.
        });
        
        // Align 'vendor_quotations'
        Schema::table('vendor_quotations', function (Blueprint $table) {
            if (!Schema::hasColumn('vendor_quotations', 'currency')) {
                $table->string('currency')->default('IDR');
            }
             if (!Schema::hasColumn('vendor_quotations', 'is_awarded')) {
                $table->boolean('is_awarded')->default(false);
            }
             if (!Schema::hasColumn('vendor_quotations', 'notes')) {
                $table->text('notes')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_rfqs', function (Blueprint $table) {
             $table->dropColumn(['notes', 'created_by']);
        });
        Schema::table('purchase_rfq_lines', function (Blueprint $table) {
             $table->dropColumn(['uom_id']);
        });
        Schema::table('vendor_quotations', function (Blueprint $table) {
             $table->dropColumn(['currency', 'is_awarded', 'notes']);
        });
    }
};
