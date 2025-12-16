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
        Schema::create('workflow_instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained();
            $table->string('entity_type'); // App\Models\PurchaseOrder
            $table->unsignedBigInteger('entity_id'); // 123
            $table->foreignId('current_step_id')->nullable()->constrained('workflow_steps');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('initiated_by')->constrained('users');
            $table->timestamp('initiated_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
            $table->index('status');
            $table->index('workflow_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_instances');
    }
};
