<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = [
            ['name' => 'Main Warehouse', 'address' => 'Jl. Raya Utama No. 1, Jakarta'],
            ['name' => 'East Branch Storage', 'address' => 'Jl. Timur Indah No. 5, Surabaya'],
            ['name' => 'West Distribution Center', 'address' => 'Jl. Barat Damai No. 8, Bandung'],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::firstOrCreate(['name' => $warehouse['name']], $warehouse);
        }
    }
}
