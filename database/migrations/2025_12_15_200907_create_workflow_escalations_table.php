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
        Schema::create('workflow_escalations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_task_id')->constrained()->onDelete('cascade');
            $table->foreignId('escalated_from_user_id')->nullable()->constrained('users');
            $table->foreignId('escalated_to_user_id')->constrained('users');
            $table->integer('escalation_level')->default(1); // 1, 2, 3...
            $table->text('reason')->nullable();
            $table->timestamp('created_at');

            $table->index('approval_task_id');
            $table->index('escalated_to_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_escalations');
    }
};
