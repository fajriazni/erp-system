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
        Schema::create('vendor_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('vendor_id')->constrained('contacts')->onDelete('cascade');
            $table->string('bill_number')->unique(); // Internal: BILL-2024-001
            $table->string('reference_number')->nullable(); // External Invoice #
            $table->date('date');
            $table->date('due_date')->nullable();
            $table->string('status')->default('draft'); // draft, posted, paid, cancelled
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('vendor_bill_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_bill_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->string('description');
            $table->decimal('quantity', 15, 2);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_bill_items');
        Schema::dropIfExists('vendor_bills');
    }
};
