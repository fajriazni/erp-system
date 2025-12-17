<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\VendorBill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VendorBill>
 */
class VendorBillFactory extends Factory
{
    protected $model = VendorBill::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bill_number' => 'BILL-'.$this->faker->unique()->year.'-'.$this->faker->unique()->numberBetween(1000, 9999),
            'reference_number' => $this->faker->optional()->bothify('INV-####'),
            'vendor_id' => Contact::factory()->create(['type' => 'vendor']),
            'date' => $this->faker->date(),
            'due_date' => $this->faker->date(),
            'status' => 'draft',
            'total_amount' => $this->faker->randomFloat(2, 100, 10000),
            'notes' => $this->faker->sentence(),
            'purchase_order_id' => null, // Optional
        ];
    }
}
