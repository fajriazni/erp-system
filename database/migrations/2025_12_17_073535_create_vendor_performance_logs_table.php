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
        Schema::create('vendor_performance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('contacts')->cascadeOnDelete();
            $table->string('metric_type'); // 'delivery', 'quality', 'return'
            $table->morphs('reference'); // PO, GR, Return, etc.
            $table->decimal('value', 8, 2); // The metric value (0-100 for rates, days for delay)
            $table->string('description')->nullable();
            $table->date('period_date');
            $table->timestamps();

            $table->index(['vendor_id', 'metric_type']);
            $table->index('period_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_performance_logs');
    }
};
