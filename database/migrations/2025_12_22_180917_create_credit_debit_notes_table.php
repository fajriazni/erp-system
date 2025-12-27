<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_debit_notes', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['credit', 'debit']);
            $table->string('reference_number')->unique();
            $table->date('date');
            $table->string('reference_type'); // 'invoice' or 'bill'
            $table->unsignedBigInteger('reference_id');
            $table->foreignId('contact_id')->constrained('contacts')->onDelete('restrict');
            $table->decimal('amount', 15, 2);
            $table->text('reason');
            $table->enum('status', ['draft', 'posted', 'applied', 'void'])->default('draft');
            $table->foreignId('journal_entry_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();

            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_debit_notes');
    }
};
