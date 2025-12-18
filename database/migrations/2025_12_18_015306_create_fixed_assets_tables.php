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
        Schema::create('asset_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('depreciation_method')->default('straight_line'); // e.g., straight_line, double_declining
            $table->integer('useful_life_years');

            // Accounting Integration
            $table->foreignId('asset_account_id')->constrained('chart_of_accounts')->restrictOnDelete();
            $table->foreignId('accumulated_depreciation_account_id')->constrained('chart_of_accounts')->restrictOnDelete();
            $table->foreignId('depreciation_expense_account_id')->constrained('chart_of_accounts')->restrictOnDelete();

            $table->timestamps();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('asset_number')->unique();
            $table->foreignId('category_id')->constrained('asset_categories')->restrictOnDelete();

            $table->date('purchase_date');
            $table->date('start_depreciation_date');

            $table->decimal('cost', 15, 2);
            $table->decimal('salvage_value', 15, 2)->default(0);

            $table->string('status')->default('draft'); // draft, active, fully_depreciated, disposed, sold
            $table->string('serial_number')->nullable();
            $table->string('location')->nullable();

            $table->timestamps();
        });

        Schema::create('depreciation_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('gl_entry_id')->constrained('journal_entries')->restrictOnDelete();

            $table->date('date');
            $table->decimal('amount', 15, 2);
            $table->decimal('book_value_after', 15, 2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('depreciation_entries');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('asset_categories');
    }
};
