<?php

namespace App\Domain\Purchasing\ValueObjects;

use InvalidArgumentException;

class Money
{
    private function __construct(
        private readonly float $amount,
        private readonly string $currency
    ) {
        if ($amount < 0) {
            throw new InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function from(float $amount, ?string $currency = null): self
    {
        // Get currency from company settings if not provided
        $currency = $currency ?? self::getCompanyCurrency();

        return new self($amount, strtoupper($currency));
    }

    public static function zero(?string $currency = null): self
    {
        return self::from(0, $currency);
    }

    public function add(Money $other): Money
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Cannot add money with different currencies: {$this->currency} and {$other->currency}"
            );
        }

        return new Money($this->amount + $other->amount, $this->currency);
    }

    public function subtract(Money $other): Money
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Cannot subtract money with different currencies: {$this->currency} and {$other->currency}"
            );
        }

        return new Money($this->amount - $other->amount, $this->currency);
    }

    public function multiply(float $multiplier): Money
    {
        return new Money($this->amount * $multiplier, $this->currency);
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function formatted(): string
    {
        return number_format($this->amount, 2, '.', ',');
    }

    public function formattedWithCurrency(): string
    {
        return $this->currency.' '.$this->formatted();
    }

    public function equals(Money $other): bool
    {
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function greaterThan(Money $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amount > $other->amount;
    }

    public function lessThan(Money $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amount < $other->amount;
    }

    private function ensureSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Cannot compare money with different currencies: {$this->currency} and {$other->currency}"
            );
        }
    }

    private static function getCompanyCurrency(): string
    {
        // Get from company settings
        $company = \App\Models\Company::first();

        return $company?->currency ?? config('app.currency', 'USD');
    }

    public function __toString(): string
    {
        return $this->formattedWithCurrency();
    }
}
