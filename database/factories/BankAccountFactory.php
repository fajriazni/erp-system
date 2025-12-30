<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BankAccount>
 */
class BankAccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company() . ' Bank',
            'bank_name' => $this->faker->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI']),
            'account_number' => $this->faker->bankAccountNumber(),
            'currency' => 'IDR',
            'opening_balance' => $this->faker->numberBetween(1000000, 1000000000),
            'current_balance' => function (array $attributes) {
                return $attributes['opening_balance'];
            },
            'chart_of_account_id' => ChartOfAccount::factory(),
            'is_active' => true,
            'description' => $this->faker->sentence(),
        ];
    }
}
