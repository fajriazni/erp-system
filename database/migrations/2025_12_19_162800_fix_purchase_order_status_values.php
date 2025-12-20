<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update non-standard status values to standard ones
        DB::table('purchase_orders')
            ->where('status', 'purchase_order')
            ->update(['status' => 'open']);
            
        DB::table('purchase_orders')
            ->where('status', 'completed')
            ->update(['status' => 'closed']);
            
        DB::table('purchase_orders')
            ->where('status', 'rfq_sent')
            ->update(['status' => 'draft']); // or 'to_approve' depending on context
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally revert if needed
        DB::table('purchase_orders')
            ->where('status', 'open')
            ->update([ 'status' => 'purchase_order']);
            
        DB::table('purchase_orders')
            ->where('status', 'closed')
            ->update(['status' => 'completed']);
    }
};
