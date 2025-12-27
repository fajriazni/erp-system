<?php

namespace App\Domain\Shared\ValueObjects;

use InvalidArgumentException;
use Stringable;

/**
 * Money Value Object
 *
 * Represents a monetary value with currency.
 * Immutable and provides arithmetic operations.
 */
final class Money implements Stringable
{
    private function __construct(
        private readonly float $amount,
        private readonly string $currency
    ) {
        if ($amount < 0) {
            throw new InvalidArgumentException('Amount cannot be negative');
        }

        if (strlen($currency) !== 3) {
            throw new InvalidArgumentException('Currency code must be 3 characters (ISO 4217)');
        }
    }

    public static function from(float $amount, string $currency = 'USD'): self
    {
        return new self($amount, strtoupper($currency));
    }

    public static function zero(string $currency = 'USD'): self
    {
        return new self(0, strtoupper($currency));
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function add(Money $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amount + $other->amount, $this->currency);
    }

    public function subtract(Money $other): self
    {
        $this->ensureSameCurrency($other);

        if ($this->amount < $other->amount) {
            throw new InvalidArgumentException('Result would be negative');
        }

        return new self($this->amount - $other->amount, $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        if ($multiplier < 0) {
            throw new InvalidArgumentException('Multiplier cannot be negative');
        }

        return new self($this->amount * $multiplier, $this->currency);
    }

    public function divide(float $divisor): self
    {
        if ($divisor <= 0) {
            throw new InvalidArgumentException('Divisor must be positive');
        }

        return new self($this->amount / $divisor, $this->currency);
    }

    public function isGreaterThan(Money $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amount > $other->amount;
    }

    public function isLessThan(Money $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amount < $other->amount;
    }

    public function equals(Money $other): bool
    {
        return $this->currency === $other->currency
            && abs($this->amount - $other->amount) < 0.01;
    }

    public function isZero(): bool
    {
        return abs($this->amount) < 0.01;
    }

    public function format(int $decimals = 2): string
    {
        return $this->currency.' '.number_format($this->amount, $decimals);
    }

    public function __toString(): string
    {
        return $this->format();
    }

    public function toArray(): array
    {
        return [
            'amount' => $this->amount,
            'currency' => $this->currency,
            'formatted' => $this->format(),
        ];
    }

    private function ensureSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Currency mismatch: {$this->currency} vs {$other->currency}"
            );
        }
    }
}
