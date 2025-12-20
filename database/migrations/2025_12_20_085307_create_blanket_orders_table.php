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
        Schema::create('blanket_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('contacts');
            $table->foreignId('purchase_agreement_id')->nullable()->constrained('purchase_agreements')->nullOnDelete();
            $table->string('number')->unique(); // BPO-2025-001
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('amount_limit', 15, 2);
            $table->string('status')->default('draft'); // draft, active, closed
            $table->timestamps();
        });

        Schema::create('blanket_order_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blanket_order_id')->constrained('blanket_orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('quantity_agreed', 15, 2)->nullable(); // Nullable if only value-based
            $table->decimal('quantity_ordered', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blanket_order_lines');
        Schema::dropIfExists('blanket_orders');
    }
};
