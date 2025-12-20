<?php

namespace App\Domain\Purchasing\Actions\BlanketOrder;

use App\Domain\Purchasing\Data\BlanketOrderData;
use App\Models\BlanketOrder;

class UpdateBlanketOrder
{
    public function execute(BlanketOrder $blanketOrder, BlanketOrderData $data): BlanketOrder
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($blanketOrder, $data) {
            $blanketOrder->update([
                'vendor_id' => $data->vendor_id,
                'purchase_agreement_id' => $data->purchase_agreement_id,
                'number' => $data->number,
                'start_date' => $data->start_date,
                'end_date' => $data->end_date,
                'amount_limit' => $data->amount_limit,
                'status' => $data->status,
                'renewal_reminder_days' => $data->renewal_reminder_days,
                'is_auto_renew' => $data->is_auto_renew,
            ]);

            // Sync lines
            $existingIds = collect($data->lines)->pluck('id')->filter()->toArray();
            $blanketOrder->lines()->whereNotIn('id', $existingIds)->delete();

            if (!empty($data->lines)) {
                foreach ($data->lines as $line) {
                    if (isset($line['id'])) {
                        $blanketOrder->lines()->where('id', $line['id'])->update([
                            'product_id' => $line['product_id'],
                            'unit_price' => $line['unit_price'],
                            'quantity_agreed' => $line['quantity_agreed'] ?? null,
                        ]);
                    } else {
                        $blanketOrder->lines()->create([
                            'product_id' => $line['product_id'],
                            'unit_price' => $line['unit_price'],
                            'quantity_agreed' => $line['quantity_agreed'] ?? null,
                        ]);
                    }
                }
            }

            return $blanketOrder;
        });
    }
}
