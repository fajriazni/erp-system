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
        Schema::create('three_way_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goods_receipt_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vendor_bill_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['pending', 'matched', 'partial_match', 'mismatch', 'approved'])->default('pending');
            
            // Variance tracking
            $table->decimal('qty_variance', 10, 2)->default(0);
            $table->decimal('price_variance', 10, 2)->default(0);
            $table->decimal('amount_variance', 15, 2)->default(0);
            $table->decimal('variance_percentage', 5, 2)->default(0);
            
            // Discrepancies detail (JSON)
            $table->json('discrepancies')->nullable();
            
            // Matching metadata
            $table->timestamp('matched_at')->nullable();
            $table->foreignId('matched_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Approval (if variance exceeds tolerance)
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'created_at']);
            $table->index('matched_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('three_way_matches');
    }
};
