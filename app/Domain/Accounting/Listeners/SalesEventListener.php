<?php

namespace App\Domain\Accounting\Listeners;

use App\Domain\Accounting\ACL\SalesAdapterInterface;
use App\Domain\Accounting\DomainServices\AutomaticJournalingService;
use App\Domain\Sales\Events\CustomerInvoicePosted;

final class SalesEventListener
{
    public function __construct(
        private readonly SalesAdapterInterface $adapter,
        private readonly AutomaticJournalingService $journalingService
    ) {}

    public function handleCustomerInvoicePosted(CustomerInvoicePosted $event): void
    {
        $aclData = $this->adapter->translateInvoice($event->invoice);
        $this->journalingService->process($aclData);
    }
}
