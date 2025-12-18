<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->decimal('subtotal', 15, 2)->default(0)->after('total');
            $table->decimal('tax_rate', 5, 2)->default(0)->after('subtotal');
            $table->decimal('tax_amount', 15, 2)->default(0)->after('tax_rate');
            $table->decimal('withholding_tax_rate', 5, 2)->default(0)->after('tax_amount');
            $table->decimal('withholding_tax_amount', 15, 2)->default(0)->after('withholding_tax_rate');
            $table->boolean('tax_inclusive')->default(false)->after('withholding_tax_amount');
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->default(0)->after('total');
            $table->decimal('tax_amount', 15, 2)->default(0)->after('tax_rate');
        });

        // Backfill existing records: set subtotal = total for existing POs
        DB::statement('UPDATE purchase_orders SET subtotal = total WHERE subtotal = 0');
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal',
                'tax_rate',
                'tax_amount',
                'withholding_tax_rate',
                'withholding_tax_amount',
                'tax_inclusive',
            ]);
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn(['tax_rate', 'tax_amount']);
        });
    }
};
