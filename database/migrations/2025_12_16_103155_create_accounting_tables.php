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
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type'); // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->nullable();
            $table->date('date');
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft, posted
            $table->timestamps();
        });

        Schema::create('journal_entry_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chart_of_account_id')->constrained();
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entry_lines');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('chart_of_accounts');
    }
};
