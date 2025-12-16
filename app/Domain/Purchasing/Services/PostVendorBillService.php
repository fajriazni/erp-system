<?php

namespace App\Domain\Purchasing\Services;

use App\Models\VendorBill;
use Illuminate\Support\Facades\DB;
use Exception;

class PostVendorBillService
{
    public function execute(VendorBill $bill): void
    {
        if ($bill->status !== 'draft') {
            throw new Exception('Only draft bills can be posted.');
        }

        DB::transaction(function () use ($bill) {
            $bill->update(['status' => 'posted']);

            // TODO: Create Journal Entry here when Accounting module is ready.
            // Debit: Expense / Inventory
            // Credit: Accounts Payable
        });
    }
}
