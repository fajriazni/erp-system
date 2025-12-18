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
        Schema::create('stock_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained();
            $table->foreignId('product_id')->constrained();
            // Optional: location_id if implementing bin management
            // $table->foreignId('location_id')->nullable()->constrained();
            
            $table->string('type'); // inbound, outbound, internal, adjustment
            $table->decimal('quantity', 15, 2); // Positive or negative
            $table->timestamp('date')->useCurrent();
            
            // Polymorphic relation to the source document (PO, SO, etc.)
            $table->nullableMorphs('reference');
            
            $table->text('description')->nullable();
            $table->timestamps();
            
            // Index for faster lookups
            $table->index(['warehouse_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_moves');
    }
};
