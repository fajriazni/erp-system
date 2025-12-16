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
        Schema::create('workflow_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_task_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->enum('type', ['email', 'in_app', 'sms'])->default('in_app');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('approval_task_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_notifications');
    }
};
