<?php

namespace App\Domain\Purchasing\Exceptions;

use DomainException;

class InvalidPurchaseAgreementStateException extends DomainException
{
    public static function cannotSubmit(string $status): self
    {
        return new self("Cannot submit a purchase agreement with status: {$status}");
    }

    public static function cannotApprove(string $status): self
    {
        return new self("Cannot approve a purchase agreement with status: {$status}");
    }

    public static function cannotReject(string $status): self
    {
        return new self("Cannot reject a purchase agreement with status: {$status}");
    }
}
