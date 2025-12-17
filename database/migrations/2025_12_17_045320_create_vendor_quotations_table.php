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
        Schema::create('vendor_quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_rfq_id')->constrained('purchase_rfqs')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('contacts');
            $table->string('reference_number')->nullable(); // Vendor's Quote #
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->date('valid_until')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, won, lost
            $table->timestamp('awarded_at')->nullable();
            // nullable FK to PO because PO might not exist yet
            $table->unsignedBigInteger('purchase_order_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_quotations');
    }
};
