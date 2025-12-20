<?php

namespace App\Domain\Purchasing\Actions\BlanketOrder;

use App\Domain\Purchasing\Data\BlanketOrderData;
use App\Models\BlanketOrder;

class CreateBlanketOrder
{
    public function execute(BlanketOrderData $data): BlanketOrder
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $bpo = BlanketOrder::create([
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

            if (!empty($data->lines)) {
                foreach ($data->lines as $line) {
                    $bpo->lines()->create($line);
                }
            }

            return $bpo;
        });
    }
}
