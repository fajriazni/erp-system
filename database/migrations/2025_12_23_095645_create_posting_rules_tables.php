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
        Schema::create('posting_rules', function (Blueprint $table) {
            $table->id();
            $table->string('event_type')->unique(); // e.g., 'sales.invoice.posted'
            $table->string('description')->nullable();
            $table->string('module')->nullable(); // sales, purchasing, inventory
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('posting_rule_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('posting_rule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chart_of_account_id')->constrained();
            $table->enum('debit_credit', ['debit', 'credit']);
            $table->string('amount_key'); // total, subtotal, tax_amount, etc.
            $table->string('description_template')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posting_rule_lines');
        Schema::dropIfExists('posting_rules');
    }
};
