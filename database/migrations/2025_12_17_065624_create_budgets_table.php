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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('department_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->year('fiscal_year');
            $table->enum('period_type', ['annual', 'quarterly', 'monthly'])->default('annual');
            $table->unsignedTinyInteger('period_number')->default(1); // Q1-4 or M1-12
            $table->decimal('amount', 15, 2);
            $table->decimal('warning_threshold', 5, 2)->default(80.00); // Warn at 80%
            $table->boolean('is_strict')->default(false); // Block if exceeded
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
