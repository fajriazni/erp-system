<?php

namespace Database\Seeders;

use App\Models\Uom;
use Illuminate\Database\Seeder;

class UomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $uoms = [
            ['name' => 'Pieces', 'symbol' => 'pcs'],
            ['name' => 'Kilogram', 'symbol' => 'kg'],
            ['name' => 'Gram', 'symbol' => 'g'],
            ['name' => 'Liter', 'symbol' => 'l'],
            ['name' => 'Meter', 'symbol' => 'm'],
            ['name' => 'Box', 'symbol' => 'box'],
            ['name' => 'Dozen', 'symbol' => 'doz'],
        ];

        foreach ($uoms as $uom) {
            Uom::firstOrCreate(['symbol' => $uom['symbol']], $uom);
        }
    }
}
