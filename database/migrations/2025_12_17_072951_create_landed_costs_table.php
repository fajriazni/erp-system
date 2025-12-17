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
        Schema::create('landed_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_id')->constrained()->cascadeOnDelete();
            $table->string('cost_type'); // 'freight', 'insurance', 'customs', 'handling', 'other'
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->enum('allocation_method', ['by_value', 'by_quantity', 'by_weight'])->default('by_value');
            $table->foreignId('expense_account_id')->nullable()->constrained('chart_of_accounts');
            $table->string('reference_number')->nullable(); // Invoice/reference from vendor
            $table->timestamps();

            $table->index('goods_receipt_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landed_costs');
    }
};
