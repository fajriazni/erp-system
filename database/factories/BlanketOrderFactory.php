<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BlanketOrder>
 */
class BlanketOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vendor_id' => Contact::factory()->state(['type' => 'vendor']),
            'number' => $this->faker->unique()->bothify('BPO-####-????'),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->optional()->date(),
            'amount_limit' => $this->faker->randomFloat(2, 5000, 500000),
            'status' => 'open',
        ];
    }
}
