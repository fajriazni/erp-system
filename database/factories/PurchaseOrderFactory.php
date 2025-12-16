<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vendor_id' => Contact::factory()->create(['type' => 'vendor'])->id,
            'warehouse_id' => Warehouse::factory(),
            'document_number' => 'PO/'.date('Y').'/'.fake()->unique()->numberBetween(1, 9999),
            'date' => fake()->date(),
            'status' => 'draft',
            'total' => fake()->randomFloat(2, 100, 10000),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
