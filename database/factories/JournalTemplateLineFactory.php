<?php

namespace Database\Factories;

use App\Models\ChartOfAccount;
use App\Models\JournalTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JournalTemplateLine>
 */
class JournalTemplateLineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'journal_template_id' => JournalTemplate::factory(),
            'chart_of_account_id' => ChartOfAccount::factory(),
            'debit_credit' => $this->faker->randomElement(['debit', 'credit']),
            'amount_formula' => 'total',
            'description' => $this->faker->sentence(),
            'sequence' => $this->faker->randomDigitNotNull(),
        ];
    }
}
