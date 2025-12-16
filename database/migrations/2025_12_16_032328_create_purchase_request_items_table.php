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
        Schema::create('purchase_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->text('description')->nullable(); // Snapshot or custom description
            $table->decimal('quantity', 10, 2);
            $table->foreignId('uom_id')->constrained();
            $table->decimal('estimated_unit_price', 15, 2)->default(0);
            $table->decimal('estimated_total', 15, 2)->default(0);
            $table->string('status')->default('pending'); // pending, ordered (partially/fully?)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_request_items');
    }
};
