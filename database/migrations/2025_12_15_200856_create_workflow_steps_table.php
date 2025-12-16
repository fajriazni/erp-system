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
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->onDelete('cascade');
            $table->integer('step_number'); // Sequence
            $table->string('name'); // e.g., "Manager Approval"
            $table->enum('step_type', ['approval', 'notification', 'conditional', 'parallel'])->default('approval');
            $table->json('config'); // Approvers, conditions, etc.
            $table->integer('sla_hours')->nullable(); // For escalation
            $table->timestamps();

            $table->unique(['workflow_id', 'step_number']);
            $table->index('workflow_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_steps');
    }
};
