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
        Schema::table('goods_receipts', function (Blueprint $table) {
            $table->timestamp('received_at')->nullable()->after('received_by');
            $table->string('delivery_note_number')->nullable()->after('received_at');
            $table->text('physical_condition')->nullable()->after('delivery_note_number');
            $table->foreignId('posted_by')->nullable()->after('physical_condition')->constrained('users');
            $table->timestamp('posted_at')->nullable()->after('posted_by');
            $table->foreignId('cancelled_by')->nullable()->after('posted_at')->constrained('users');
            $table->timestamp('cancelled_at')->nullable()->after('cancelled_by');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goods_receipts', function (Blueprint $table) {
            $table->dropForeign(['posted_by']);
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn([
                'received_at',
                'delivery_note_number',
                'physical_condition',
                'posted_by',
                'posted_at',
                'cancelled_by',
                'cancelled_at',
                'cancellation_reason',
            ]);
        });
    }
};
