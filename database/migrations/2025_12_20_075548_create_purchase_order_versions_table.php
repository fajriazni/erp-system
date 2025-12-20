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
        Schema::create('purchase_order_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->integer('version_number'); // Sequential: 1, 2, 3...
            $table->string('change_type'); // created, updated, status_changed, items_modified
            $table->text('change_summary')->nullable(); // Human-readable summary
            $table->json('snapshot'); // Full PO state including items
            $table->json('changes')->nullable(); // Diff from previous version
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamp('created_at');
            
            $table->index(['purchase_order_id', 'version_number']);
            $table->unique(['purchase_order_id', 'version_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_versions');
    }
};
