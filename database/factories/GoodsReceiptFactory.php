<?php

namespace Database\Factories;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class GoodsReceiptFactory extends Factory
{
    protected $model = GoodsReceipt::class;

    public function definition(): array
    {
        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'warehouse_id' => Warehouse::factory(),
            'receipt_number' => 'GR-'.fake()->unique()->numberBetween(1000, 9999),
            'date' => fake()->date(),
            'status' => 'draft',
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function posted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'posted',
            'posted_at' => now(),
            'posted_by' => 1,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => 1,
            'cancellation_reason' => fake()->sentence(),
        ]);
    }
}
