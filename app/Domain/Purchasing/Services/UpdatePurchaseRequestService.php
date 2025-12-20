<?php

namespace App\Domain\Purchasing\Services;

use App\Models\Product;
use App\Models\PurchaseRequest;
use Illuminate\Support\Facades\DB;

class UpdatePurchaseRequestService
{
    public function __construct(
        // protected \App\Domain\Finance\Services\BudgetCheckService $budgetService // Pending budget update logic
    ) {}

    public function execute(PurchaseRequest $pr, array $data, int $userId): PurchaseRequest
    {
        if ($pr->status !== 'draft') {
            throw new \Exception('Only draft purchase requests can be updated.');
        }

        return DB::transaction(function () use ($pr, $data) {
            // 1. Update Header
            $pr->update([
                'date' => $data['date'] ?? $pr->date,
                'required_date' => $data['required_date'] ?? $pr->required_date,
                'notes' => $data['notes'] ?? $pr->notes,
                // 'department_id' => ... if we allow changing department, we definitely need budget recalculation
            ]);

            // 2. Re-create Items (Simple Sync)
            // In a more complex scenario, we might diff items to preserve IDs if needed,
            // but for a draft, replacing them is usually acceptable and safer for totals.
            $pr->items()->delete();

            $totalAmount = 0;

            foreach ($data['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                $uomId = $itemData['uom_id'] ?? $product->uom_id;

                if (! $uomId) {
                    throw new \Exception("Product '{$product->name}' does not have a Unit of Measure defined.");
                }

                $estimatedTotal = $itemData['quantity'] * ($itemData['estimated_unit_price'] ?? 0);
                $totalAmount += $estimatedTotal;

                $pr->items()->create([
                    'product_id' => $itemData['product_id'],
                    'description' => $product->name,
                    'quantity' => $itemData['quantity'],
                    'uom_id' => $uomId,
                    'estimated_unit_price' => $itemData['estimated_unit_price'] ?? 0,
                    'estimated_total' => $estimatedTotal,
                ]);
            }

            // 3. TODO: Update Budget Encumbrance
            // We would need to release the previous encumbrance and create a new one.
            // For this MVP step, we are skipping the budget encumbrance update strictly,
            // but existing encumbrance will remain. Ideally, we should update it.

            return $pr->refresh();
        });
    }
}
