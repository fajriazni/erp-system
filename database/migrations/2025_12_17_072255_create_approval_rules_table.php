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
        Schema::create('approval_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('entity_type'); // 'purchase_request', 'purchase_order', 'expense', 'vendor_bill'
            $table->decimal('min_amount', 15, 2)->default(0);
            $table->decimal('max_amount', 15, 2)->nullable(); // null = unlimited
            $table->foreignId('role_id')->nullable()->constrained();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->integer('level')->default(1); // 1 = first approver, 2 = second, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['entity_type', 'is_active']);
            $table->index(['min_amount', 'max_amount']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_rules');
    }
};
