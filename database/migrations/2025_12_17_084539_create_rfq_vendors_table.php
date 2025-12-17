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
        Schema::create('rfq_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_rfq_id')->constrained('purchase_rfqs')->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('contacts')->onDelete('cascade');
            $table->string('status')->default('sent'); // sent, responded, declined
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rfq_vendors');
    }
};
