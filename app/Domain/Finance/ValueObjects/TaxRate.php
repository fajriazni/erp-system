<?php

namespace App\Domain\Finance\ValueObjects;

use InvalidArgumentException;

/**
 * Tax Rate Value Object
 *
 * Represents a tax rate percentage with calculation methods.
 */
class TaxRate
{
    private function __construct(
        private readonly float $rate
    ) {
        if ($rate < 0 || $rate > 100) {
            throw new InvalidArgumentException('Tax rate must be between 0 and 100');
        }
    }

    public static function from(float $rate): self
    {
        return new self($rate);
    }

    public static function zero(): self
    {
        return new self(0);
    }

    public function value(): float
    {
        return $this->rate;
    }

    public function asDecimal(): float
    {
        return $this->rate / 100;
    }

    public function calculateTaxAmount(Money $base): Money
    {
        return $base->multiply($this->asDecimal());
    }

    public function calculateGrossAmount(Money $base): Money
    {
        return $base->multiply(1 + $this->asDecimal());
    }

    public function calculateBaseFromGross(Money $gross): Money
    {
        return $gross->divide(1 + $this->asDecimal());
    }

    public function isZero(): bool
    {
        return abs($this->rate) < 0.01;
    }

    public function format(): string
    {
        return number_format($this->rate, 2).'%';
    }

    public function equals(TaxRate $other): bool
    {
        return abs($this->rate - $other->rate) < 0.01;
    }
}
