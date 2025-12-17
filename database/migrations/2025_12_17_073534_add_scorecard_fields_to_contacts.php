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
        Schema::table('contacts', function (Blueprint $table) {
            $table->decimal('rating_score', 3, 2)->nullable()->after('is_supplier'); // 0.00 - 5.00
            $table->decimal('on_time_rate', 5, 2)->nullable()->after('rating_score'); // Percentage 0-100
            $table->decimal('quality_rate', 5, 2)->nullable()->after('on_time_rate'); // Percentage 0-100
            $table->decimal('return_rate', 5, 2)->nullable()->after('quality_rate'); // Percentage 0-100
            $table->timestamp('last_score_update')->nullable()->after('return_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['rating_score', 'on_time_rate', 'quality_rate', 'return_rate', 'last_score_update']);
        });
    }
};
