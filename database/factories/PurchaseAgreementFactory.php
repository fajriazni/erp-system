<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseAgreement>
 */
class PurchaseAgreementFactory extends Factory
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
            'reference_number' => $this->faker->unique()->bothify('CTR-####-????'),
            'title' => $this->faker->sentence(3),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->optional()->date(),
            'status' => 'active',
            'total_value_cap' => $this->faker->randomFloat(2, 1000, 100000),
        ];
    }
}
