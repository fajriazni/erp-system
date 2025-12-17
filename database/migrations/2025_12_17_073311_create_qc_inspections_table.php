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
        Schema::create('qc_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inspector_id')->constrained('users');
            $table->integer('passed_qty');
            $table->integer('failed_qty');
            $table->text('notes')->nullable();
            $table->json('checklist_results')->nullable(); // For structured QC checklists
            $table->timestamps();

            $table->index('goods_receipt_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qc_inspections');
    }
};
