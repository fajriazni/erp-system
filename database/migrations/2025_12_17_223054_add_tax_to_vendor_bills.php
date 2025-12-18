<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendor_bills', function (Blueprint $table) {
            $table->decimal('subtotal', 15, 2)->default(0)->after('total_amount');
            $table->decimal('tax_rate', 5, 2)->default(0)->after('subtotal');
            $table->decimal('tax_amount', 15, 2)->default(0)->after('tax_rate');
            $table->decimal('withholding_tax_rate', 5, 2)->default(0)->after('tax_amount');
            $table->decimal('withholding_tax_amount', 15, 2)->default(0)->after('withholding_tax_rate');
            $table->boolean('tax_inclusive')->default(false)->after('withholding_tax_amount');
        });

        Schema::table('vendor_bill_items', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->default(0)->after('total');
            $table->decimal('tax_amount', 15, 2)->default(0)->after('tax_rate');
        });

        // Backfill existing records: set subtotal = total_amount for existing bills
        DB::statement('UPDATE vendor_bills SET subtotal = total_amount WHERE subtotal = 0');
    }

    public function down(): void
    {
        Schema::table('vendor_bills', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal',
                'tax_rate',
                'tax_amount',
                'withholding_tax_rate',
                'withholding_tax_amount',
                'tax_inclusive',
            ]);
        });

        Schema::table('vendor_bill_items', function (Blueprint $table) {
            $table->dropColumn(['tax_rate', 'tax_amount']);
        });
    }
};
