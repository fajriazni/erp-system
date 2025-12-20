<?php

namespace App\Domain\Purchasing\Actions\Contract;

use App\Models\PurchaseAgreement;
use Illuminate\Support\Facades\Storage;

class DeleteContract
{
    public function execute(PurchaseAgreement $contract): void
    {
        if ($contract->document_path) {
            Storage::disk('public')->delete($contract->document_path);
        }
        $contract->delete();
    }
}
