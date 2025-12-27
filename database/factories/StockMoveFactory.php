<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockMove>
 */
class StockMoveFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'warehouse_id' => \App\Models\Warehouse::factory(),
            'product_id' => \App\Models\Product::factory(),
            'type' => fake()->randomElement(['receipt', 'issue', 'transfer', 'scrap']),
            'quantity' => fake()->randomFloat(2, 1, 100),
            'date' => now(),
            'description' => fake()->sentence(),
        ];
    }
}
