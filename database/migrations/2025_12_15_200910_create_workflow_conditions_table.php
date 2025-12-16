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
        Schema::create('workflow_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_step_id')->constrained()->onDelete('cascade');
            $table->string('field_path'); // e.g., total, vendor.rating, department.id
            $table->enum('operator', ['=', '!=', '>', '<', '>=', '<=', 'in', 'not_in', 'between', 'contains']);
            $table->json('value'); // Flexible value storage
            $table->enum('logical_operator', ['and', 'or'])->default('and');
            $table->integer('group_number')->default(1); // For grouping conditions
            $table->timestamps();

            $table->index('workflow_step_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_conditions');
    }
};
