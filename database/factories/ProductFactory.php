<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'code' => $this->faker->unique()->bothify('PROD-####'),
            'type' => $this->faker->randomElement(['goods', 'service']),
            'price' => $this->faker->randomFloat(2, 1000, 1000000),
            'cost' => $this->faker->randomFloat(2, 500, 800000),
            'stock_control' => $this->faker->boolean(),
            'notes' => $this->faker->sentence(),
        ];
    }
}
