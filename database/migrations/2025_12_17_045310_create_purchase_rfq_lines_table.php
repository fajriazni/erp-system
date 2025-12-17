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
        Schema::create('purchase_rfq_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_rfq_id')->constrained('purchase_rfqs')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->decimal('quantity', 10, 2);
            $table->string('uom')->nullable();
            $table->decimal('target_price', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_rfq_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_rfq_id')->constrained('purchase_rfqs')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('contacts')->cascadeOnDelete();
            $table->timestamp('sent_at')->nullable();
            $table->string('status')->default('pending'); // pending, sent, responded
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_rfq_vendors');
        Schema::dropIfExists('purchase_rfq_lines');
    }
};
