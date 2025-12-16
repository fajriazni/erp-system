<?php

namespace App\Domain\Purchasing\Exceptions;

use Exception;

class InvalidPurchaseOrderStateException extends Exception
{
    public static function cannotSubmit(string $currentStatus): self
    {
        return new self("Cannot submit purchase order with status: {$currentStatus}. Only draft orders can be submitted.");
    }

    public static function cannotApprove(string $currentStatus): self
    {
        return new self("Cannot approve purchase order with status: {$currentStatus}. Only orders pending approval can be approved.");
    }

    public static function cannotCancel(string $currentStatus): self
    {
        return new self("Cannot cancel purchase order with status: {$currentStatus}. Locked or already cancelled orders cannot be cancelled.");
    }

    public static function cannotEdit(string $currentStatus): self
    {
        return new self("Cannot edit purchase order with status: {$currentStatus}. Only draft orders can be edited.");
    }

    public static function cannotDelete(string $currentStatus): self
    {
        return new self("Cannot delete purchase order with status: {$currentStatus}. Only draft or cancelled orders can be deleted.");
    }
}
