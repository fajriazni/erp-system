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
        Schema::create('tax_periods', function (Blueprint $table) {
            $table->id();
            $table->string('period')->unique(); // e.g., "2025-01"
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('input_tax', 15, 2)->default(0); // PPN Masukan (from Vendor Bills)
            $table->decimal('output_tax', 15, 2)->default(0); // PPN Keluaran (from Customer Invoices)
            $table->decimal('net_tax', 15, 2)->default(0); // Kurang/(Lebih) Bayar PPN
            $table->enum('status', ['draft', 'submitted'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['period', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_periods');
    }
};
