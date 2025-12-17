<?php

namespace Database\Factories;

use App\Models\PurchaseRfq;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseRfqFactory extends Factory
{
    protected $model = PurchaseRfq::class;

    public function definition(): array
    {
        return [
            'document_number' => 'RFQ-' . now()->format('Y') . '-' . $this->faker->unique()->numerify('####'),
            'title' => $this->faker->sentence,
            'deadline' => now()->addDays(7),
            'status' => 'open',
            'created_by' => User::factory(),
            'user_id' => function (array $attributes) {
                return $attributes['created_by'];
            },
            'notes' => $this->faker->sentence,
        ];
    }
}
