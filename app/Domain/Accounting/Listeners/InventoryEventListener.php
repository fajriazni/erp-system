<?php

namespace App\Domain\Accounting\Listeners;

use App\Domain\Accounting\ACL\InventoryAdapterInterface;
use App\Domain\Accounting\DomainServices\AutomaticJournalingService;
use App\Domain\Inventory\Events\StockMoveRecorded;

final class InventoryEventListener
{
    public function __construct(
        private readonly InventoryAdapterInterface $adapter,
        private readonly AutomaticJournalingService $journalingService
    ) {}

    public function handleStockMoveRecorded(StockMoveRecorded $event): void
    {
        // Only process adjustments for now, or other types if rules exist
        if ($event->stockMove->type !== 'adjustment') {
            return;
        }

        $aclData = $this->adapter->translateStockMove($event->stockMove);

        if (empty($aclData['lines'])) {
            return;
        }

        $this->journalingService->process($aclData);
    }
}
