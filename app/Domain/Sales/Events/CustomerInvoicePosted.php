<?php

namespace App\Domain\Sales\Events;

use App\Models\CustomerInvoice;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class CustomerInvoicePosted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CustomerInvoice $invoice
    ) {}
}
