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
        Schema::create('approval_requests', function (Blueprint $table) {
            $table->id();
            $table->morphs('approvable'); // polymorphic: PR, PO, Expense, etc.
            $table->foreignId('approval_rule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('approver_id')->constrained('users');
            $table->integer('level');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['approvable_type', 'approvable_id', 'status']);
            $table->index(['approver_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_requests');
    }
};
