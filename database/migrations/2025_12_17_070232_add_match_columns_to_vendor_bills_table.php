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
        Schema::table('vendor_bills', function (Blueprint $table) {
            $table->string('match_status')->default('pending')->after('status'); // pending, matched, exception
            $table->json('match_exceptions')->nullable()->after('match_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_bills', function (Blueprint $table) {
            $table->dropColumn(['match_status', 'match_exceptions']);
        });
    }
};
