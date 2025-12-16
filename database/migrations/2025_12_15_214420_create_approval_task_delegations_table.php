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
        Schema::create('approval_task_delegations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_user_id')->constrained('users');
            $table->foreignId('to_user_id')->constrained('users');
            $table->timestamp('delegated_at');
            $table->timestamp('expires_at')->nullable();
            $table->text('reason')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_task_delegations');
    }
};
