<?php

namespace App\Domain\Accounting\ValueObjects;

use InvalidArgumentException;
use Stringable;

/**
 * Account Code Value Object
 *
 * Represents a chart of account code with validation and type derivation.
 * Implements Account Code rules according to GL Domain.
 */
final class AccountCode implements Stringable
{
    private function __construct(
        private readonly string $code
    ) {
        if (! preg_match('/^\d{4}(-\d{3,4})?$/', $code)) {
            throw new InvalidArgumentException('Account code must be exactly 4 digits, or 4 digits followed by a dash and 3-4 digits (e.g., 1101 or 1101-100)');
        }
    }

    public static function from(string $code): self
    {
        return new self($code);
    }

    public static function fromString(string $code): self
    {
        return new self($code);
    }

    public function value(): string
    {
        return $this->code;
    }

    public function toString(): string
    {
        return $this->code;
    }

    /**
     * Derive account type from code ranges
     *
     * 1xxx: Assets
     * 2xxx: Liabilities
     * 3xxx: Equity
     * 4xxx: Revenue
     * 5xxx: Expenses
     */
    public function deriveType(): string
    {
        $mainCode = substr($this->code, 0, 1);

        return match ($mainCode) {
            '1' => 'asset',
            '2' => 'liability',
            '3' => 'equity',
            '4' => 'revenue',
            '5', '6', '7', '8', '9' => 'expense',
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
