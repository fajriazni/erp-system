<?php

namespace App\Domain\Purchasing\Actions\Contract;

use App\Domain\Purchasing\Data\ContractData;
use App\Models\PurchaseAgreement;
use Illuminate\Support\Facades\Storage;

class UpdateContract
{
    public function execute(PurchaseAgreement $contract, ContractData $data): PurchaseAgreement
    {
        $attributes = [
            'vendor_id' => $data->vendor_id,
            'reference_number' => $data->reference_number,
            'title' => $data->title,
            'start_date' => $data->start_date,
            'end_date' => $data->end_date,
            'status' => $data->status,
            'total_value_cap' => $data->total_value_cap,
            'renewal_reminder_days' => $data->renewal_reminder_days,
            'is_auto_renew' => $data->is_auto_renew,
        ];

        if ($data->document) {
            if ($contract->document_path) {
                Storage::disk('public')->delete($contract->document_path);
            }
            $attributes['document_path'] = $data->document->store('contracts', 'public');
        }

        $contract->update($attributes);

        return $contract;
    }
}
