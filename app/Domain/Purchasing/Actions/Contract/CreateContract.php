<?php

namespace App\Domain\Purchasing\Actions\Contract;

use App\Domain\Purchasing\Data\ContractData;
use App\Models\PurchaseAgreement;
use Illuminate\Support\Facades\Storage;

class CreateContract
{
    public function execute(ContractData $data): PurchaseAgreement
    {
        $path = null;
        if ($data->document) {
            $path = $data->document->store('contracts', 'public');
        }

        return PurchaseAgreement::create([
            'vendor_id' => $data->vendor_id,
            'reference_number' => $data->reference_number,
            'title' => $data->title,
            'start_date' => $data->start_date,
            'end_date' => $data->end_date,
            'status' => $data->status,
            'total_value_cap' => $data->total_value_cap,
            'document_path' => $path,
            'renewal_reminder_days' => $data->renewal_reminder_days,
            'is_auto_renew' => $data->is_auto_renew,
        ]);
    }
}
