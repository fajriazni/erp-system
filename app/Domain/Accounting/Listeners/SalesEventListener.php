<?php

namespace App\Domain\Accounting\Listeners;

use App\Domain\Accounting\Services\AutomatedPostingService;
use App\Domain\Sales\Events\CustomerInvoicePosted;

final class SalesEventListener
{
    public function __construct(
        private readonly AutomatedPostingService $postingService
    ) {}

    public function handleCustomerInvoicePosted(CustomerInvoicePosted $event): void
    {
        $invoice = $event->invoice;
        
        $this->postingService->handle(
            'sales.invoice.posted',
            $invoice->toArray(),
            $invoice->reference_number, // Use reference number (e.g., INV-001) as journal reference
            "Invoice {$invoice->invoice_number}", // Fallback description
            $invoice->date->format('Y-m-d')
        );
    }
}
