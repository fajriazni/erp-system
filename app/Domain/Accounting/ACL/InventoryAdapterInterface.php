<?php

namespace App\Domain\Accounting\ACL;

/**
 * Anti-Corruption Layer for Inventory Bounded Context
 */
interface InventoryAdapterInterface
{
    /**
     * Translates Goods Receipts/Issues to Accounting Commands/Events
     */
    public function translateStockMove(object $stockMove): array;
}
