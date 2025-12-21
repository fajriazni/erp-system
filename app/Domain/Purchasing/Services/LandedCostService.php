<?php

namespace App\Domain\Purchasing\Services;

use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\LandedCost;
use App\Models\LandedCostAllocation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LandedCostService
{
    /**
     * Add landed costs to a goods receipt and allocate to items.
     *
     * @param  array<array{cost_type: string, description: string, amount: float, allocation_method: string, expense_account_id: int|null, reference_number: string|null}>  $costs
     */
    public function allocate(GoodsReceipt $gr, array $costs): void
    {
        // Prevent adding costs to posted receipts
        if ($gr->status === 'posted') {
            throw new \Exception('Cannot add landed costs to posted goods receipt. Costs must be added before posting.');
        }

        $items = $gr->items()->with('product')->get();

        if ($items->isEmpty()) {
            throw new \Exception('Cannot allocate landed costs to goods receipt without items.');
        }

        DB::transaction(function () use ($gr, $costs, $items) {
            foreach ($costs as $costData) {
                // Validate cost data
                if (! isset($costData['cost_type'], $costData['description'], $costData['amount'])) {
                    throw new \Exception('Invalid landed cost data. Missing required fields.');
                }

                if ($costData['amount'] <= 0) {
                    throw new \Exception('Landed cost amount must be greater than zero.');
                }

                $landedCost = LandedCost::create([
                    'goods_receipt_id' => $gr->id,
                    'cost_type' => $costData['cost_type'],
                    'description' => $costData['description'],
                    'amount' => $costData['amount'],
                    'allocation_method' => $costData['allocation_method'] ?? 'by_value',
                    'expense_account_id' => $costData['expense_account_id'] ?? null,
                    'reference_number' => $costData['reference_number'] ?? null,
                ]);

                // Calculate and create allocations
                $allocations = $this->calculateAllocation(
                    $landedCost,
                    $items
                );

                foreach ($allocations as $allocation) {
                    LandedCostAllocation::create($allocation);

                    // Update the item's effective cost
                    $this->updateItemCost($allocation['goods_receipt_item_id'], $allocation['allocated_amount']);
                }
            }
        });
    }

    /**
     * Calculate how to allocate the landed cost across GR items.
     *
     * @return array<array{landed_cost_id: int, goods_receipt_item_id: int, allocated_amount: float}>
     */
    public function calculateAllocation(LandedCost $cost, Collection $items): array
    {
        $allocations = [];

        switch ($cost->allocation_method) {
            case 'by_quantity':
                $allocations = $this->allocateByQuantity($cost, $items);
                break;

            case 'by_weight':
                $allocations = $this->allocateByWeight($cost, $items);
                break;

            case 'by_value':
            default:
                $allocations = $this->allocateByValue($cost, $items);
                break;
        }

        return $allocations;
    }

    /**
     * Allocate proportionally by item value.
     */
    private function allocateByValue(LandedCost $cost, Collection $items): array
    {
        $totalValue = $items->sum(fn ($item) => ($item->unit_cost ?? 0) * ($item->quantity_received ?? 0));

        if ($totalValue <= 0) {
            // Fall back to equal allocation
            return $this->allocateEqually($cost, $items);
        }

        $allocations = [];
        foreach ($items as $item) {
            $itemValue = ($item->unit_cost ?? 0) * ($item->quantity_received ?? 0);
            $proportion = $itemValue / $totalValue;

            $allocations[] = [
                'landed_cost_id' => $cost->id,
                'goods_receipt_item_id' => $item->id,
                'allocated_amount' => round($cost->amount * $proportion, 2),
            ];
        }

        return $allocations;
    }

    /**
     * Allocate by quantity (equal per unit).
     */
    private function allocateByQuantity(LandedCost $cost, Collection $items): array
    {
        $totalQty = $items->sum('quantity_received');

        if ($totalQty <= 0) {
            return $this->allocateEqually($cost, $items);
        }

        $allocations = [];
        foreach ($items as $item) {
            $proportion = ($item->quantity_received ?? 0) / $totalQty;

            $allocations[] = [
                'landed_cost_id' => $cost->id,
                'goods_receipt_item_id' => $item->id,
                'allocated_amount' => round($cost->amount * $proportion, 2),
            ];
        }

        return $allocations;
    }

    /**
     * Allocate by weight.
     */
    private function allocateByWeight(LandedCost $cost, Collection $items): array
    {
        $totalWeight = $items->sum(fn ($item) => ($item->product->weight ?? 0) * ($item->quantity_received ?? 0));

        if ($totalWeight <= 0) {
            return $this->allocateByValue($cost, $items);
        }

        $allocations = [];
        foreach ($items as $item) {
            $itemWeight = ($item->product->weight ?? 0) * ($item->quantity_received ?? 0);
            $proportion = $itemWeight / $totalWeight;

            $allocations[] = [
                'landed_cost_id' => $cost->id,
                'goods_receipt_item_id' => $item->id,
                'allocated_amount' => round($cost->amount * $proportion, 2),
            ];
        }

        return $allocations;
    }

    /**
     * Allocate equally across all items.
     */
    private function allocateEqually(LandedCost $cost, Collection $items): array
    {
        $perItem = round($cost->amount / $items->count(), 2);

        $allocations = [];
        foreach ($items as $item) {
            $allocations[] = [
                'landed_cost_id' => $cost->id,
                'goods_receipt_item_id' => $item->id,
                'allocated_amount' => $perItem,
            ];
        }

        return $allocations;
    }

    /**
     * Update the GR item's effective cost.
     */
    private function updateItemCost(int $itemId, float $additionalCost): void
    {
        $item = GoodsReceiptItem::find($itemId);

        if (! $item) {
            return;
        }

        // Add landed cost to item's effective cost
        $currentLandedCost = $item->landed_cost_total ?? 0;
        $item->update([
            'landed_cost_total' => $currentLandedCost + $additionalCost,
        ]);
    }

    /**
     * Get total landed cost for a goods receipt.
     */
    public function getTotalLandedCost(GoodsReceipt $gr): float
    {
        return LandedCost::where('goods_receipt_id', $gr->id)->sum('amount');
    }

    /**
     * Remove all landed costs from a goods receipt.
     */
    public function removeLandedCosts(GoodsReceipt $gr): void
    {
        LandedCost::where('goods_receipt_id', $gr->id)->delete();
    }
}
