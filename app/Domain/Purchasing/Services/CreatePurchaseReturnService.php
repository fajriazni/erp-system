<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseReturn;
use Illuminate\Support\Facades\DB;

class CreatePurchaseReturnService
{
    public function execute(array $data): PurchaseReturn
    {
        return DB::transaction(function () use ($data) {
            // Auto-generate Document Number if not provided
            if (empty($data['document_number']) || $data['document_number'] === 'Auto-generated') {
                $latest = PurchaseReturn::latest()->first();
                $sequence = $latest ? intval(substr($latest->document_number, -4)) + 1 : 1;
                $data['document_number'] = 'RET-'.date('Ym').'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);
            }

            $return = PurchaseReturn::create([
                'document_number' => $data['document_number'],
                'vendor_id' => $data['vendor_id'],
                'warehouse_id' => $data['warehouse_id'] ?? 1, // Default to 1 if not provided
                'date' => $data['date'],
                'amount' => 0, // Will recalculate
                'notes' => $data['notes'] ?? null,
                'status' => 'draft',
            ]);

            $total = 0;
            foreach ($data['items'] as $item) {
                // Should default unit_price from Product if not set?
                // For now, assume passed or 0
                $lineTotal = round($item['quantity'] * $item['unit_price'], 2);
                $total += $lineTotal;

                $return->lines()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $lineTotal,
                ]);
            }

            $return->update(['amount' => $total]);

            return $return;
        });
    }
}
