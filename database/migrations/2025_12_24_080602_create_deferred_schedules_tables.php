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
        Schema::create('deferred_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('type', ['revenue', 'expense']);
            $table->decimal('total_amount', 15, 2);
            $table->date('start_date');
            $table->date('end_date');
            $table->foreignId('deferred_account_id')->constrained('chart_of_accounts')->name('fk_ds_deferred_acc');
            $table->foreignId('recognition_account_id')->constrained('chart_of_accounts')->name('fk_ds_recog_acc');
            $table->string('status')->default('draft'); // draft, active, completed, cancelled
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('deferred_schedule_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deferred_schedule_id')->constrained('deferred_schedules')->cascadeOnDelete();
            $table->date('date');
            $table->decimal('amount', 15, 2);
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->nullOnDelete();
            $table->boolean('is_processed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deferred_schedule_items');
        Schema::dropIfExists('deferred_schedules');
    }
};
