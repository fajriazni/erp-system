<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Add performance indexes to purchase_orders table
     */
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            // Composite index for common filter queries (status + date)
            $table->index(['status', 'date'], 'idx_po_status_date');
            
            // Composite index for vendor reports (vendor_id + status)
            $table->index(['vendor_id', 'status'], 'idx_po_vendor_status');
            
            // Index for warehouse queries
            $table->index('warehouse_id', 'idx_po_warehouse');
            
            // Index for date range queries
            $table->index('date', 'idx_po_date');
            
            // Index for created_at (useful for recent orders)
            $table->index('created_at', 'idx_po_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropIndex('idx_po_status_date');
            $table->dropIndex('idx_po_vendor_status');
            $table->dropIndex('idx_po_warehouse');
            $table->dropIndex('idx_po_date');
            $table->dropIndex('idx_po_created_at');
        });
    }
};
