<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\PurchaseReturn;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DebitNote>
 */
class DebitNoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'debit_note_number' => 'DN-'.now()->format('Ym').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
            'vendor_id' => Contact::factory()->vendor(),
            'purchase_return_id' => null,
            'date' => now(),
            'status' => 'unposted',
            'total_amount' => $this->faker->randomFloat(2, 100, 10000),
            'applied_amount' => 0,
            'remaining_amount' => fn (array $attributes) => $attributes['total_amount'],
            'reference_number' => $this->faker->optional()->numerify('REF-####'),
            'notes' => $this->faker->optional()->paragraph(),
            'posted_at' => null,
            'posted_by' => null,
            'voided_at' => null,
            'voided_by' => null,
            'void_reason' => null,
        ];
    }

    public function unposted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'unposted',
            'posted_at' => null,
            'posted_by' => null,
        ]);
    }

    public function posted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'posted',
            'posted_at' => now()->subDays(rand(1, 30)),
            'posted_by' => User::factory(),
        ]);
    }

    public function partiallyApplied(): static
    {
        return $this->state(function (array $attributes) {
            $totalAmount = $attributes['total_amount'] ?? 1000;
            $appliedAmount = $totalAmount * 0.5; // 50% applied

            return [
                'status' => 'partially_applied',
                'applied_amount' => $appliedAmount,
                'remaining_amount' => $totalAmount - $appliedAmount,
                'posted_at' => now()->subDays(rand(1, 30)),
                'posted_by' => User::factory(),
            ];
        });
    }

    public function applied(): static
    {
        return $this->state(function (array $attributes) {
            $totalAmount = $attributes['total_amount'] ?? 1000;

            return [
                'status' => 'applied',
                'applied_amount' => $totalAmount,
                'remaining_amount' => 0,
                'posted_at' => now()->subDays(rand(30, 60)),
                'posted_by' => User::factory(),
            ];
        });
    }

    public function voided(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'voided',
            'voided_at' => now(),
            'voided_by' => User::factory(),
            'void_reason' => $this->faker->sentence(),
            'remaining_amount' => 0,
        ]);
    }

    public function fromReturn(): static
    {
        return $this->state(fn (array $attributes) => [
            'purchase_return_id' => PurchaseReturn::factory(),
        ]);
    }
}
