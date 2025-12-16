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
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique();
            $table->foreignId('requester_id')->constrained('users'); // Person asking for items
            $table->foreignId('department_id')->nullable(); // Optional department link
            $table->date('date');
            $table->date('required_date')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, approved, rejected, converted
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_requests');
    }
};
