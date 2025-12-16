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
        Schema::create('workflow_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_instance_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->string('action'); // submitted, approved, rejected, delegated, escalated
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->json('metadata')->nullable(); // Additional context
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at');

            $table->index('workflow_instance_id');
            $table->index(['user_id', 'action']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_audit_logs');
    }
};
