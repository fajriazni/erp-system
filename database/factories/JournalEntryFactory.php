<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JournalEntry>
 */
class JournalEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference_number' => 'JE-'.now()->format('Ym').'-'.str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
            'date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'description' => $this->faker->sentence(),
            'status' => 'draft',
            'currency_code' => 'USD',
            'exchange_rate' => 1.0,
        ];
    }

    public function posted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'posted',
        ]);
    }
}
