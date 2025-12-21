<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseReturn>
 */
class PurchaseReturnFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'return_number' => 'RMA-'.now()->format('Ym').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
            'goods_receipt_id' => GoodsReceipt::factory(),
            'purchase_order_id' => PurchaseOrder::factory(),
            'vendor_id' => Contact::factory()->vendor(),
            'warehouse_id' => Warehouse::factory(),
            'rma_number' => null,
            'return_date' => now(),
            'status' => 'draft',
            'reason' => $this->faker->sentence(),
            'total_amount' => $this->faker->randomFloat(2, 100, 10000),
            'notes' => $this->faker->optional()->paragraph(),
            'shipped_date' => null,
            'received_by_vendor_date' => null,
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancellation_reason' => null,
            'created_by' => User::factory(),
            'approved_by' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'rma_number' => null,
        ]);
    }

    public function pendingAuthorization(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending_authorization',
            'rma_number' => null,
        ]);
    }

    public function readyToShip(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ready_to_ship',
            'rma_number' => 'RMA-'.strtoupper($this->faker->bothify('??##-####')),
            'approved_by' => User::factory(),
        ]);
    }

    public function shipped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'shipped',
            'rma_number' => 'RMA-'.strtoupper($this->faker->bothify('??##-####')),
            'shipped_date' => now()->subDays(rand(1, 7)),
        ]);
    }

    public function receivedByVendor(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'received_by_vendor',
            'rma_number' => 'RMA-'.strtoupper($this->faker->bothify('??##-####')),
            'shipped_date' => now()->subDays(rand(7, 14)),
            'received_by_vendor_date' => now()->subDays(rand(1, 6)),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'rma_number' => 'RMA-'.strtoupper($this->faker->bothify('??##-####')),
            'shipped_date' => now()->subDays(rand(14, 30)),
            'received_by_vendor_date' => now()->subDays(rand(7, 13)),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => User::factory(),
            'cancellation_reason' => $this->faker->sentence(),
        ]);
    }
}
