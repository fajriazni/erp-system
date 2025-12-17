<?php

namespace App\Domain\Purchasing\Services;

use App\Models\Product;
use App\Models\PurchaseRequest;
use Illuminate\Support\Facades\DB;

class CreatePurchaseRequestService
{
    public function __construct(
        protected \App\Domain\Approval\Services\ApprovalMatrixService $approvalService,
        protected \App\Domain\Finance\Services\BudgetCheckService $budgetService
    ) {}

    public function execute(array $data, int $requesterId): PurchaseRequest
    {
        return DB::transaction(function () use ($data, $requesterId) {
            $departmentId = $data['department_id'] ?? null;

            // 1. Calculate Total Amount First (Needed for Budget Check)
            $totalAmount = 0;
            $items = [];
            
            foreach ($data['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                $uomId = $itemData['uom_id'] ?? $product->uom_id;

                if (! $uomId) {
                    throw new \Exception("Product '{$product->name}' does not have a Unit of Measure defined.");
                }

                $estimatedTotal = $itemData['quantity'] * ($itemData['estimated_unit_price'] ?? 0);
                $totalAmount += $estimatedTotal;
                
                $items[] = [
                    'product_id' => $itemData['product_id'],
                    'product_name' => $product->name,
                    'quantity' => $itemData['quantity'],
                    'uom_id' => $uomId,
                    'estimated_unit_price' => $itemData['estimated_unit_price'] ?? 0,
                    'estimated_total' => $estimatedTotal,
                ];
            }

            // 2. Perform Budget Check
            if ($departmentId && $totalAmount > 0) {
                $checkResult = $this->budgetService->check($departmentId, $totalAmount);

                if ($checkResult->status === 'blocked') {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'budget' => [$checkResult->message]
                    ]);
                }
                
                // Note: Warnings are not blocking, we proceed.
            }

            // 3. Create PR
            $docNumber = 'PR-'.date('Ymd').'-'.strtoupper(uniqid());

            $pr = PurchaseRequest::create([
                'document_number' => $docNumber,
                'requester_id' => $requesterId,
                'department_id' => $departmentId,
                'date' => $data['date'] ?? now(),
                'required_date' => $data['required_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'draft',
            ]);

            // 4. Create Items
            foreach ($items as $item) {
                $pr->items()->create([
                    'product_id' => $item['product_id'],
                    'description' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'uom_id' => $item['uom_id'],
                    'estimated_unit_price' => $item['estimated_unit_price'],
                    'estimated_total' => $item['estimated_total'],
                ]);
            }

            // 5. Create Budget Encumbrance (Commitment)
            if ($departmentId && $totalAmount > 0 && isset($checkResult->budget)) {
                $this->budgetService->createEncumbrance($checkResult->budget, $pr, $totalAmount);
            }

            // 6. Check for approval
            if ($this->approvalService->requiresApproval('purchase_request', $totalAmount)) {
                $this->approvalService->submitForApproval($pr, $totalAmount);
                
                if ($pr->refresh()->status === 'draft') {
                    $pr->update(['status' => 'pending_approval']);
                }
            } else {
                $pr->update(['status' => 'approved']);
            }

            return $pr;
        });
    }
}
