<?php

namespace App\Domain\Inventory\Services;

use App\Models\Product;
use App\Models\StockMove;
use Illuminate\Database\Eloquent\Model;

class StockService
{
    /**
     * Record a stock movement.
     *
     * @param  float  $quantity  Positive for incoming, negative for outgoing
     * @param  string  $type  inbound, outbound, internal, adjustment
     * @param  Model|null  $reference  The source document (e.g. SalesOrder)
     */
    public function recordMove(
        int $warehouseId,
        int $productId,
        float $quantity,
        string $type,
        ?Model $reference = null,
        ?string $description = null
    ): StockMove {
        // Here we could add logic to check stock availability for outbound moves

        $move = StockMove::create([
            'warehouse_id' => $warehouseId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'type' => $type,
            'date' => now(),
            'reference_type' => $reference ? get_class($reference) : null,
            'reference_id' => $reference ? $reference->id : null,
            'description' => $description,
        ]);

        // Update product stock on hand (denormalized convenience)
        // Ideally this should be a listener or a separate process, but for simplicity:
        $this->updateProductStock($productId);

        event(new \App\Domain\Inventory\Events\StockMoveRecorded($move));

        return $move;
    }

    private function updateProductStock(int $productId): void
    {
        // Simple recalculation
        // In real ERP, this might be per warehouse
        $total = StockMove::where('product_id', $productId)->sum('quantity');
        // Assuming Product model has 'quantity_on_hand' or similar
        // Product::where('id', $productId)->update(['quantity_on_hand' => $total]);
    }
}
