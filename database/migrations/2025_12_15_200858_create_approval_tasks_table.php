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
        Schema::create('approval_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_instance_id')->constrained()->onDelete('cascade');
            $table->foreignId('workflow_step_id')->constrained();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users');
            $table->foreignId('assigned_to_role_id')->nullable()->constrained('roles');
            $table->enum('status', ['pending', 'approved', 'rejected', 'delegated', 'escalated'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('comments')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->timestamps();

            $table->index(['workflow_instance_id', 'status']);
            $table->index('assigned_to_user_id');
            $table->index('assigned_to_role_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_tasks');
    }
};
