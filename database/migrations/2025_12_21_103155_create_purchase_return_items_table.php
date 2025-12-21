<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_return_id')->constrained('purchase_returns')->cascadeOnDelete();
            $table->foreignId('goods_receipt_item_id')->nullable()->constrained('goods_receipt_items')->nullOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('quantity', 15, 2);
            $table->foreignId('uom_id')->constrained('uoms')->cascadeOnDelete();
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->enum('condition', [
                'damaged',
                'incorrect',
                'expired',
                'defective',
                'excess',
                'other',
            ])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('purchase_return_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_return_items');
    }
};
