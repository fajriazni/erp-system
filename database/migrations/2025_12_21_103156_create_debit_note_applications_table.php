<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debit_note_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debit_note_id')->constrained('debit_notes')->cascadeOnDelete();
            $table->foreignId('vendor_bill_id')->constrained('vendor_bills')->cascadeOnDelete();
            $table->decimal('amount_applied', 15, 2);
            $table->date('application_date');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('debit_note_id');
            $table->index('vendor_bill_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debit_note_applications');
    }
};
