<?php

namespace App\Domain\Accounting\ACL;

/**
 * Anti-Corruption Layer for Sales Bounded Context
 */
interface SalesAdapterInterface
{
    /**
     * Translates Sales Invoices to Accounting Commands/Events
     */
    public function translateInvoice(object $invoice): array;
}
