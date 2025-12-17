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
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique(); // e.g., RET-202312-001
            $table->foreignId('vendor_id')->constrained('contacts');
            $table->foreignId('warehouse_id')->constrained()->default(1); // Default to 1 for now or strict? Let's use constrained.
            $table->date('date');
            $table->string('status')->default('draft'); // draft, posted, cancelled
            $table->decimal('amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_return_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->decimal('quantity', 15, 4);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_return_lines');
        Schema::dropIfExists('purchase_returns');
    }
};
