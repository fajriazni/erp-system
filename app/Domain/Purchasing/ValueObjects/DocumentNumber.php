<?php

namespace App\Domain\Purchasing\ValueObjects;

use App\Models\PurchaseOrder;

class DocumentNumber
{
    private function __construct(private readonly string $value) {}

    public static function generate(?int $year = null): self
    {
        $year = $year ?? date('Y');
        $count = PurchaseOrder::whereYear('created_at', $year)->count() + 1;

        $number = sprintf('PO/%d/%04d', $year, $count);

        return new self($number);
    }

    public static function from(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
