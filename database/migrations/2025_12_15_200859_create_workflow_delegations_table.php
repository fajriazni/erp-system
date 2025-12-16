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
        Schema::create('workflow_delegations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delegator_user_id')->constrained('users');
            $table->foreignId('delegate_user_id')->constrained('users');
            $table->foreignId('workflow_id')->nullable()->constrained(); // null = all workflows
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['delegator_user_id', 'is_active']);
            $table->index(['delegate_user_id', 'is_active']);
            $table->index('workflow_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_delegations');
    }
};
