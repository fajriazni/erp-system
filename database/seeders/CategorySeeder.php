<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Product Categories
            ['name' => 'Raw Materials', 'type' => 'product'],
            ['name' => 'Finished Goods', 'type' => 'product'],
            ['name' => 'Services', 'type' => 'product'],
            ['name' => 'Packaging', 'type' => 'product'],

            // Contact Categories
            ['name' => 'VIP Customer', 'type' => 'contact'],
            ['name' => 'Regular Customer', 'type' => 'contact'],
            ['name' => 'Local Vendor', 'type' => 'contact'],
            ['name' => 'Import Vendor', 'type' => 'contact'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name'], 'type' => $category['type']],
                $category
            );
        }
    }
}
