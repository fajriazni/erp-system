<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Purchasing\ValueObjects\DocumentNumber;
use App\Models\Product;
use App\Models\PurchaseRequest;
use Illuminate\Support\Facades\DB;

class CreatePurchaseRequestService
{
    public function execute(array $data, int $requesterId): PurchaseRequest
    {
        return DB::transaction(function () use ($data, $requesterId) {
            // Generate simple document number for PR (PR-YYYYMMDD-XXXX)
            // Or use the standard DocumentNumber service if applicable, 
            // but let's keep it simple or reusable.
            // Using a simple unique generator for now or verify if DocumentNumber VO supports PR prefix.
            // Let's assume manual generation for now to be safe or use date based.
            $docNumber = 'PR-' . date('Ymd') . '-' . strtoupper(uniqid());

            $pr = PurchaseRequest::create([
                'document_number' => $docNumber,
                'requester_id' => $requesterId,
                'department_id' => $data['department_id'] ?? null, // Optional
                'date' => $data['date'] ?? now(),
                'required_date' => $data['required_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'draft',
            ]);

            foreach ($data['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                
                $uomId = $itemData['uom_id'] ?? $product->uom_id;
                
                if (!$uomId) {
                    throw new \Exception("Product '{$product->name}' does not have a Unit of Measure defined.");
                }

                $pr->items()->create([
                    'product_id' => $itemData['product_id'],
                    'description' => $product->name,
                    'quantity' => $itemData['quantity'],
                    'uom_id' => $uomId,
                    'estimated_unit_price' => $itemData['estimated_unit_price'] ?? 0, // Optional estimation
                    'estimated_total' => ($itemData['quantity'] * ($itemData['estimated_unit_price'] ?? 0)),
                ]);
            }

            return $pr;
        });
    }
}
