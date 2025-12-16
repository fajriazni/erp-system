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
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('module'); // purchasing, expense, etc.
            $table->string('entity_type'); // App\Models\PurchaseOrder
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->index(['module', 'entity_type']);
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};
