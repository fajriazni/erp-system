<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseRfq;
use Illuminate\Support\Facades\DB;

class CreateRfqService
{
    public function execute(array $data, int $userId): PurchaseRfq
    {
        return DB::transaction(function () use ($data, $userId) {
            $year = now()->format('Y');
            $count = PurchaseRfq::whereYear('created_at', $year)->count() + 1;
            $number = 'RFQ-'.$year.'-'.str_pad($count, 4, '0', STR_PAD_LEFT);

            $rfq = PurchaseRfq::create([
                'document_number' => $number,
                'title' => $data['title'],
                'deadline' => $data['deadline'],
                'created_by' => $userId,
                'user_id' => $userId, // Maintain calling code compat if needed
                'status' => 'draft',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                // If uom_id is not provided, try to get it from product?
                // For now assuming it is passed or handled by frontend
                $rfq->lines()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'uom_id' => $item['uom_id'] ?? null,
                    'target_price' => $item['target_price'] ?? null,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            if (! empty($data['vendor_ids'])) {
                $rfq->vendors()->sync($data['vendor_ids']);
            }

            return $rfq;
        });
    }
}
