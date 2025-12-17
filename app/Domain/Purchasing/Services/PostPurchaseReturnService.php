<?php

namespace App\Domain\Purchasing\Services;

use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Models\PurchaseReturn;
use Exception;
use Illuminate\Support\Facades\DB;

class PostPurchaseReturnService
{
    public function __construct(
        protected CreateJournalEntryService $createJournalEntryService
    ) {}

    public function execute(PurchaseReturn $return): void
    {
        if ($return->status !== 'draft') {
            throw new Exception('Only draft returns can be posted.');
        }

        DB::transaction(function () use ($return) {
            // 1. Update Status
            $return->update(['status' => 'posted']);

            // 2. Reduce Inventory
            foreach ($return->lines as $line) {
                // Decrement specific warehouse stock
                $pivot = DB::table('product_warehouse')
                    ->where('product_id', $line->product_id)
                    ->where('warehouse_id', $return->warehouse_id)
                    ->first();

                if ($pivot) {
                    DB::table('product_warehouse')
                        ->where('id', $pivot->id)
                        ->decrement('quantity', $line->quantity);
                } else {
                    // Should not happen if returning items we have, but just in case
                    DB::table('product_warehouse')->insert([
                        'product_id' => $line->product_id,
                        'warehouse_id' => $return->warehouse_id,
                        'quantity' => -$line->quantity,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Also Update Global Stock Quantity if Product model uses it
                // $line->product->decrement('stock_quantity', $line->quantity); // Removed as column doesn't exist
            }

            // 3. Create Journal Entry (Debit Note)
            // Debit: Accounts Payable (Liability decreases)
            // Credit: Inventory (Asset decreases)

            // Note: Use mapped accounts if available. Using placeholders or finding specific accounts.
            // Debiting 'Accounts Payable' (2000)
            // Crediting 'Inventory Asset' (1200)

            $apAccount = \App\Models\ChartOfAccount::where('code', '2000')->firstOrFail();
            $invAccount = \App\Models\ChartOfAccount::where('code', '1200')->firstOrFail();

            $this->createJournalEntryService->execute(
                $return->date->format('Y-m-d'),
                $return->document_number,
                "Purchase Return $return->document_number",
                [
                    [
                        'chart_of_account_id' => $apAccount->id,
                        'debit' => $return->amount,
                        'credit' => 0,
                    ],
                    [
                        'chart_of_account_id' => $invAccount->id,
                        'debit' => 0,
                        'credit' => $return->amount,
                    ],
                ]
            );
        });
    }
}
