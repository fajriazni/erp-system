<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use Exception;
use Illuminate\Support\Facades\DB;

class ConvertPRToPOService
{
    public function execute(PurchaseRequest $request, int $vendorId): PurchaseOrder
    {
        if ($request->status !== 'approved') {
            throw new Exception("Only approved Purchase Requests can be converted to Purchase Orders.");
        }

        return DB::transaction(function () use ($request, $vendorId) {
             // Generate PO Number (Simple or use sequence service)
             $poNumber = 'PO-' . date('Ymd') . '-' . strtoupper(uniqid());

             $po = PurchaseOrder::create([
                 'document_number' => $poNumber,
                 'vendor_id' => $vendorId,
                 'warehouse_id' => \App\Models\Warehouse::first()->id ?? 1, // Default to first available or 1
                 'date' => now(),
                 'status' => 'draft',
                 'purchase_request_id' => $request->id,
                 'notes' => 'Converted from ' . $request->document_number . "\n" . $request->notes,
             ]);

             foreach ($request->items as $item) {
                 $po->items()->create([
                     'product_id' => $item->product_id,
                     'description' => $item->description, // Or product description
                     'quantity' => $item->quantity,
                     'unit_price' => $item->estimated_unit_price, // Use estimated or 0
                     'subtotal' => $item->estimated_total,
                 ]);
             }

             $po->recalculateTotal();

             // Update PR status? Or just link it?
             // Maybe mark PR as 'converted'?
             $request->status = 'converted';
             $request->save();

             return $po;
        });
    }
}
