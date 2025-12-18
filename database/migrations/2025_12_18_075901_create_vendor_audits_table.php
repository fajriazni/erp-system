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
        Schema::create('vendor_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('contacts')->cascadeOnDelete();
            $table->string('audit_type'); // initial, periodic, quality, compliance
            $table->date('audit_date');
            $table->foreignId('auditor_id')->constrained('users');
            $table->decimal('score', 5, 2)->nullable(); // 0-100
            $table->string('status')->default('scheduled'); // scheduled, in_progress, completed
            $table->json('criteria_scores')->nullable(); // Individual criteria scores
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->date('next_audit_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_audits');
    }
};
