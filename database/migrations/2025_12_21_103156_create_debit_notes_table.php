<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debit_notes', function (Blueprint $table) {
            $table->id();
            $table->string('debit_note_number')->unique();
            $table->foreignId('purchase_return_id')->nullable()->constrained('purchase_returns')->nullOnDelete();
            $table->foreignId('vendor_id')->constrained('contacts')->cascadeOnDelete();
            $table->date('date');
            $table->date('due_date')->nullable();
            $table->enum('status', [
                'unposted',
                'posted',
                'partially_applied',
                'applied',
                'closed',
                'voided',
            ])->default('unposted');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('applied_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();

            // Posting
            $table->timestamp('posted_at')->nullable();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();

            // Voiding
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('void_reason')->nullable();

            $table->timestamps();

            $table->index(['status', 'date']);
            $table->index('vendor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debit_notes');
    }
};
