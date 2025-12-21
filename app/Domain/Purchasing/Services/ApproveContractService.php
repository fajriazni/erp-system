<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseAgreement;
use Illuminate\Support\Facades\DB;

class ApproveContractService
{
    public function execute(int $contractId): void
    {
        DB::transaction(function () use ($contractId) {
            $contract = PurchaseAgreement::findOrFail($contractId);

            // Domain logic handles validation and state transition
            $contract->approve();

            // Potentially trigger other actions, like notifying vendor?
        });
    }
}
