<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VendorClaim>
 */
class VendorClaimFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'claim_number' => 'CLM-'.now()->format('Ym').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
            'vendor_id' => Contact::factory()->vendor(),
            'purchase_order_id' => PurchaseOrder::factory(),
            'goods_receipt_id' => null,
            'claim_type' => $this->faker->randomElement([
                'price_difference',
                'damaged_goods',
                'missing_items',
                'shipping_cost',
                'quality_issue',
                'other',
            ]),
            'claim_date' => now(),
            'status' => 'submitted',
            'claim_amount' => $this->faker->randomFloat(2, 50, 5000),
            'description' => $this->faker->paragraph(),
            'evidence_attachments' => null,
            'vendor_response' => null,
            'settlement_type' => null,
            'settlement_amount' => null,
            'settlement_date' => null,

            'submitted_by' => User::factory(),
            'reviewed_by' => null,
            'approved_by' => null,
            'settled_by' => null,
        ];
    }

    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'submitted',
        ]);
    }

    public function underReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'under_review',
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function disputed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'disputed',
            'vendor_response' => $this->faker->paragraph(),
        ]);
    }

    public function settled(): static
    {
        return $this->state(function (array $attributes) {
            $claimAmount = $attributes['claim_amount'] ?? 1000;
            $settlementType = $this->faker->randomElement(['refund', 'credit_note', 'replacement']);

            return [
                'status' => 'settled',
                'settlement_type' => $settlementType,
                'settlement_amount' => $claimAmount * $this->faker->randomFloat(2, 0.5, 1.0), // 50-100% of claim
                'settlement_date' => now()->subDays(rand(1, 7)),
            ];
        });
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'vendor_response' => $this->faker->paragraph(),
        ]);
    }

    public function withEvidence(): static
    {
        return $this->state(fn (array $attributes) => [
            'evidence_attachments' => json_encode([
                'photo1.jpg',
                'photo2.jpg',
                'invoice.pdf',
            ]),
        ]);
    }

    public function damagedGoods(): static
    {
        return $this->state(fn (array $attributes) => [
            'claim_type' => 'damaged_goods',
            'description' => 'Items arrived damaged during shipping. Photos attached.',
        ]);
    }

    public function qualityIssue(): static
    {
        return $this->state(fn (array $attributes) => [
            'claim_type' => 'quality_issue',
            'description' => 'Products do not meet quality specifications.',
        ]);
    }
}
