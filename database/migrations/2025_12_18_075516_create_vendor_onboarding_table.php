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
        Schema::create('vendor_onboarding', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('contacts')->cascadeOnDelete();
            $table->string('status')->default('pending'); // pending, in_review, approved, rejected
            $table->json('documents')->nullable(); // Store uploaded document paths
            $table->json('checklist')->nullable(); // Onboarding checklist completion status
            $table->text('notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_onboarding');
    }
};
