<?php

namespace App\Domain\Accounting\ACL;

use App\Models\CustomerInvoice;

final class SalesAdapter implements SalesAdapterInterface
{
    public function translateInvoice(object $invoice): array
    {
        if (! $invoice instanceof CustomerInvoice) {
            throw new \InvalidArgumentException('Expected CustomerInvoice, got '.get_class($invoice));
        }

        // Mapping rule:
        // Debit AR (1100)
        // Credit Sales (4000)
        // Credit Output Tax (2300)

        $lines = [];

        // 1. Debit AR (Total Amount)
        $lines[] = [
            'account_code' => '1100',
            'amount' => $invoice->total_amount,
            'type' => 'debit',
            'description' => "Piutang Usaha - Invoice #{$invoice->invoice_number}",
        ];

        // 2. Credit Sales (Subtotal)
        $lines[] = [
            'account_code' => '4000',
            'amount' => $invoice->subtotal,
            'type' => 'credit',
            'description' => "Penjualan - Invoice #{$invoice->invoice_number}",
        ];

        // 3. Credit Output Tax (Tax Amount)
        if ($invoice->tax_amount > 0) {
            $lines[] = [
                'account_code' => '2300',
                'amount' => $invoice->tax_amount,
                'type' => 'credit',
                'description' => "PPN Keluaran - Invoice #{$invoice->invoice_number}",
            ];
        }

        return [
            'date' => $invoice->posted_at->format('Y-m-d'),
            'description' => "Auto-Journal: Customer Invoice #{$invoice->invoice_number} - {$invoice->customer->name}",
            'lines' => $lines,
        ];
    }
}
