<?php

namespace App\Domain\Accounting\ACL;

use App\Models\StockMove;

final class InventoryAdapter implements InventoryAdapterInterface
{
    public function translateStockMove(object $stockMove): array
    {
        if (! $stockMove instanceof StockMove) {
            throw new \InvalidArgumentException('Expected StockMove, got '.get_class($stockMove));
        }

        // Simplistic Mapping Rule for Stock Adjustment:
        // If adjustment (increase): Debit Inventory (1200), Credit Adjustment Gain (5500)
        // If adjustment (decrease): Debit Adjustment Loss (5500), Credit Inventory (1200)

        // This is a placeholder. Real logic depends on product cost (FIFO/Average).
        // For now, we'll assume a dummy value or use product's default cost.
        $estimatedCost = 100.0; // Mock value
        $totalAmount = abs($stockMove->quantity) * $estimatedCost;

        $lines = [];

        if ($stockMove->type === 'adjustment') {
            if ($stockMove->quantity > 0) {
                // Increase
                $lines[] = ['account_code' => '1200', 'amount' => $totalAmount, 'type' => 'debit', 'description' => 'Stock increase'];
                $lines[] = ['account_code' => '5500', 'amount' => $totalAmount, 'type' => 'credit', 'description' => 'Stock adjustment gain'];
            } else {
                // Decrease
                $lines[] = ['account_code' => '5500', 'amount' => $totalAmount, 'type' => 'debit', 'description' => 'Stock decrease'];
                $lines[] = ['account_code' => '1200', 'amount' => $totalAmount, 'type' => 'credit', 'description' => 'Stock adjustment loss'];
            }
        }

        return [
            'date' => $stockMove->date->format('Y-m-d'),
            'description' => "Auto-Journal: Stock Move #{$stockMove->id} ({$stockMove->type})",
            'lines' => $lines,
        ];
    }
}
