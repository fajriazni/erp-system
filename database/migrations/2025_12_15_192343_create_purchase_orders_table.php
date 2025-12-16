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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('contacts');
            $table->foreignId('warehouse_id')->constrained('warehouses');
            $table->string('document_number')->unique(); // e.g., PO/2024/0001
            $table->date('date');
            $table->string('status')->default('draft'); // draft, rfq_sent, to_approve, purchase_order, locked, cancelled
            $table->decimal('total', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
