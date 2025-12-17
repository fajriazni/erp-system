<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\VendorPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

class VendorPaymentFactory extends Factory
{
    protected $model = VendorPayment::class;

    public function definition(): array
    {
        return [
            'payment_number' => 'PAY-'.$this->faker->unique()->year.'-'.$this->faker->unique()->numberBetween(1000, 9999),
            'vendor_id' => Contact::factory()->create(['type' => 'vendor']),
            'date' => $this->faker->date(),
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'reference' => $this->faker->optional()->bothify('REF-####'),
            'notes' => $this->faker->sentence(),
        ];
    }
}
