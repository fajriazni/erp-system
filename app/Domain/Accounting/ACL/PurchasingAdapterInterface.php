<?php

namespace App\Domain\Accounting\ACL;

/**
 * Anti-Corruption Layer for Purchasing Bounded Context
 */
interface PurchasingAdapterInterface
{
    /**
     * Translates Vendor Bills to Accounting Commands/Events
     */
    public function translateBill(object $bill): array;

    /**
     * Translates Goods Receipts to Accounting Commands/Events
     */
    public function translateGoodsReceipt(\App\Models\GoodsReceipt $receipt): array;
}
