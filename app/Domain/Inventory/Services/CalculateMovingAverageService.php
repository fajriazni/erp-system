<?php

namespace App\Domain\Inventory\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CalculateMovingAverageService
{
    /**
     * Calculate and update the moving average cost of a product.
     *
     * Formula:
     * New Cost = ((Current Total Stock * Current Cost) + (Incoming Qty * Purchase Price)) / (Current Total Stock + Incoming Qty)
     *
     * @return float The new cost
     */
    public function execute(Product $product, float $incomingQty, float $purchasePrice): float
    {
        // 1. Get Current Total Stock across all warehouses
        // We look at product_warehouse table
        $currentTotalStock = DB::table('product_warehouse')
            ->where('product_id', $product->id)
            ->sum('quantity');

        $currentCost = $product->cost;

        // 2. Calculate Values
        $currentValue = $currentTotalStock * $currentCost;
        $incomingValue = $incomingQty * $purchasePrice;

        $newTotalStock = $currentTotalStock + $incomingQty;

        if ($newTotalStock <= 0) {
            // Edge case: if total stock is 0 or negative (shouldn't happen in reception usually but possible with negative adjustments)
            // If stock becomes 0, usually cost remains last known or 0?
            // If we are receiving stock into 0 stock, cost is purchase price.
            return $purchasePrice;
        }

        $newCost = ($currentValue + $incomingValue) / $newTotalStock;

        return round($newCost, 2);
    }
}
