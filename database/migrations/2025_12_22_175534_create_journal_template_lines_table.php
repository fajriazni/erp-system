<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_template_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_template_id')->constrained()->onDelete('cascade');
            $table->foreignId('chart_of_account_id')->constrained()->onDelete('restrict');
            $table->enum('debit_credit', ['debit', 'credit']);
            $table->string('amount_formula')->nullable(); // e.g., "total", "total*0.10", "balance"
            $table->string('description')->nullable();
            $table->integer('sequence')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_template_lines');
    }
};
