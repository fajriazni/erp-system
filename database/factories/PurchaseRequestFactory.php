<?php

namespace Database\Factories;

use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseRequestFactory extends Factory
{
    protected $model = PurchaseRequest::class;

    public function definition(): array
    {
        return [
            'document_number' => 'PR-'.$this->faker->unique()->date('Ymd').'-'.$this->faker->randomNumber(4),
            'requester_id' => User::factory(),
            'date' => now(),
            'required_date' => now()->addDays(7),
            'status' => 'draft',
            'notes' => $this->faker->sentence(),
        ];
    }
}
