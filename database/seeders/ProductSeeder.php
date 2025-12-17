<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample Products
        $products = [
            [
                'name' => 'Laptop High-End',
                'code' => 'P-001',
                'type' => 'goods',
                'price' => 15000000,
                'cost' => 12000000,
                'stock_control' => true,
                'notes' => 'High performance laptop',
            ],
            [
                'name' => 'Office Chair Ergonomic',
                'code' => 'P-002',
                'type' => 'goods',
                'price' => 2500000,
                'cost' => 1800000,
                'stock_control' => true,
                'notes' => 'Comfortable chair',
            ],
            [
                'name' => 'Consultation Service',
                'code' => 'S-001',
                'type' => 'service',
                'price' => 500000,
                'cost' => 0,
                'stock_control' => false,
                'notes' => 'Hourly rate',
            ],
            [
                'name' => 'Wireless Mouse',
                'code' => 'P-003',
                'type' => 'goods',
                'price' => 150000,
                'cost' => 90000,
                'stock_control' => true,
                'notes' => 'Battery included',
            ],
        ];

        $uom = \App\Models\Uom::where('symbol', 'pcs')->first();
        $uomId = $uom ? $uom->id : 1; // Fallback to 1 if not found, though UOM seeder should run first

        foreach ($products as $product) {
            $product['uom_id'] = $uomId;
            Product::updateOrCreate(['code' => $product['code']], $product);
        }
    }
}
