<?php

namespace App\Domain\Accounting\Listeners;

use App\Domain\Accounting\ACL\PurchasingAdapter;
use App\Domain\Accounting\DomainServices\AutomaticJournalingService;
use App\Domain\Purchasing\Events\GoodsReceiptPosted;

final class PurchasingEventListener
{
    public function __construct(
        private readonly PurchasingAdapter $adapter,
        private readonly AutomaticJournalingService $journalingService
    ) {}

    public function handleGoodsReceiptPosted(GoodsReceiptPosted $event): void
    {
        $aclData = $this->adapter->translateGoodsReceipt($event->goodsReceipt);
        $this->journalingService->process($aclData);
    }
}
