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
        Schema::create('purchase_agreements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('contacts');
            $table->string('reference_number')->unique();
            $table->string('title');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('status')->default('active'); // active, expired, terminated
            $table->string('document_path')->nullable();
            $table->decimal('total_value_cap', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_agreements');
    }
};
