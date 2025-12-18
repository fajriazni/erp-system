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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('stage')->default('prospecting'); // prospecting, qualification, proposal, negotiation, closed_won, closed_lost
            $table->date('close_date')->nullable();
            $table->foreignId('contact_id')->nullable()->constrained('contacts'); // Linked to a customer/contact
            $table->foreignId('lead_id')->nullable()->constrained('leads'); // Optional link to origin lead
            $table->foreignId('owner_id')->nullable()->constrained('users');
            $table->integer('probability')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
