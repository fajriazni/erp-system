<?php

namespace App\Domain\Finance\ValueObjects;

use InvalidArgumentException;
use Stringable;

/**
 * Account Code Value Object
 *
 * Represents a chart of account code with validation and type derivation.
 */
class AccountCode implements Stringable
{
    private function __construct(
        private readonly string $code
    ) {
        if (! preg_match('/^\d{4}$/', $code)) {
            throw new InvalidArgumentException('Account code must be exactly 4 digits');
        }
    }

    public static function from(string $code): self
    {
        return new self($code);
    }

    public function value(): string
    {
        return $this->code;
    }

    /**
     * Derive account type from code ranges
     *
     * 1000-1999: Assets
     * 2000-2999: Liabilities
     * 3000-3999: Equity
     * 4000-4999: Revenue
     * 5000-9999: Expenses
     */
    public function deriveType(): string
    {
        $numericCode = (int) $this->code;

        return match (true) {
            $numericCode >= 1000 && $numericCode < 2000 => 'asset',
            $numericCode >= 2000 && $numericCode < 3000 => 'liability',
            $numericCode >= 3000 && $numericCode < 4000 => 'equity',
            $numericCode >= 4000 && $numericCode < 5000 => 'revenue',
            $numericCode >= 5000 => 'expense',
            default => throw new InvalidArgumentException("Invalid account code range: {$this->code}"),
        };
    }

    public function isAsset(): bool
    {
        return $this->deriveType() === 'asset';
    }

    public function isLiability(): bool
    {
        return $this->deriveType() === 'liability';
    }

    public function isEquity(): bool
    {
        return $this->deriveType() === 'equity';
    }

    public function isRevenue(): bool
    {
        return $this->deriveType() === 'revenue';
    }

    public function isExpense(): bool
    {
        return $this->deriveType() === 'expense';
    }

    public function equals(AccountCode $other): bool
    {
        return $this->code === $other->code;
    }

    public function __toString(): string
    {
        return $this->code;
    }
}
