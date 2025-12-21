<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number')->unique();
            $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
            $table->foreignId('goods_receipt_id')->nullable()->constrained('goods_receipts')->nullOnDelete();
            $table->foreignId('vendor_id')->constrained('contacts')->cascadeOnDelete();
            $table->enum('claim_type', [
                'price_difference',
                'damaged_goods',
                'missing_items',
                'shipping_cost',
                'quality_issue',
                'other',
            ]);
            $table->date('claim_date');
            $table->decimal('claim_amount', 15, 2);
            $table->enum('status', [
                'submitted',
                'under_review',
                'disputed',
                'approved',
                'settled',
                'rejected',
            ])->default('submitted');
            $table->text('description');
            $table->json('evidence_attachments')->nullable();
            $table->text('vendor_response')->nullable();
            $table->enum('settlement_type', [
                'replacement',
                'refund',
                'credit_note',
                'other',
            ])->nullable();
            $table->decimal('settlement_amount', 15, 2)->nullable();
            $table->date('settlement_date')->nullable();

            // Tracking
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('settled_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['status', 'claim_date']);
            $table->index('vendor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_claims');
    }
};
