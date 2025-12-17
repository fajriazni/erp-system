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
        Schema::create('vendor_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique();
            $table->foreignId('vendor_id')->constrained('contacts');
            $table->date('date');
            $table->decimal('amount', 15, 2);
            $table->string('reference')->nullable();
            $table->string('payment_method')->default('bank_transfer'); // bank_transfer, cash, check
            $table->text('notes')->nullable();
            $table->string('status')->default('posted'); // posted, cancelled
            $table->timestamps();
        });

        Schema::create('vendor_payment_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_bill_id')->constrained();
            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_payment_lines');
        Schema::dropIfExists('vendor_payments');
    }
};
