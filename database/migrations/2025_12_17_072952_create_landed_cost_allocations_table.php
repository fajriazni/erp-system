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
        Schema::create('landed_cost_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landed_cost_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goods_receipt_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('allocated_amount', 15, 2);
            $table->timestamps();

            $table->unique(['landed_cost_id', 'goods_receipt_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landed_cost_allocations');
    }
};
