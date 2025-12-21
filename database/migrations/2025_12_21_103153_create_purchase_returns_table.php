<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('goods_receipt_id')->nullable()->constrained('goods_receipts')->nullOnDelete();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('contacts')->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->string('rma_number')->nullable()->comment('Vendor Return Authorization Number');
            $table->date('return_date');
            $table->enum('status', [
                'draft',
                'pending_authorization',
                'ready_to_ship',
                'shipped',
                'received_by_vendor',
                'completed',
                'cancelled',
            ])->default('draft');
            $table->text('reason')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();

            // Status timestamps
            $table->timestamp('shipped_date')->nullable();
            $table->timestamp('received_by_vendor_date')->nullable();

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();

            // Tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['status', 'return_date']);
            $table->index('vendor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_returns');
    }
};
