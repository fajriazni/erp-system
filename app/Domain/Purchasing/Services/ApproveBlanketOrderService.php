<?php

namespace App\Domain\Purchasing\Services;

use App\Models\BlanketOrder;
use Illuminate\Support\Facades\DB;

class ApproveBlanketOrderService
{
    public function execute(int $blanketOrderId): void
    {
        DB::transaction(function () use ($blanketOrderId) {
            $blanketOrder = BlanketOrder::findOrFail($blanketOrderId);

            // Domain logic handles validation and state transition
            $blanketOrder->approve();

            // Potentially trigger other actions, like notifying vendor?
        });
    }
}
