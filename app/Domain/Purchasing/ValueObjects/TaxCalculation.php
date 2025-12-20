<?php

namespace App\Domain\Purchasing\ValueObjects;

use InvalidArgumentException;

/**
 * TaxCalculation Value Object
 *
 * Encapsulates tax calculation logic for Purchase Orders
 */
class TaxCalculation
{
    private function __construct(
        private readonly Money $subtotal,
        private readonly float $taxRate,
        private readonly float $withholdingTaxRate,
        private readonly bool $taxInclusive
    ) {
        if ($taxRate < 0 || $taxRate > 100) {
            throw new InvalidArgumentException('Tax rate must be between 0 and 100');
        }

        if ($withholdingTaxRate < 0 || $withholdingTaxRate > 100) {
            throw new InvalidArgumentException('Withholding tax rate must be between 0 and 100');
        }
    }

    public static function calculate(
        Money $subtotal,
        float $taxRate,
        float $withholdingTaxRate = 0,
        bool $taxInclusive = false
    ): self {
        return new self($subtotal, $taxRate, $withholdingTaxRate, $taxInclusive);
    }

    public function taxAmount(): Money
    {
        if ($this->taxInclusive) {
            // If tax inclusive, tax is embedded in subtotal
            // Tax = Subtotal * (TaxRate / (100 + TaxRate))
            $taxAmount = $this->subtotal->amount() * ($this->taxRate / (100 + $this->taxRate));
        } else {
            // If tax exclusive, tax is added on top
            // Tax = Subtotal * (TaxRate / 100)
            $taxAmount = $this->subtotal->amount() * ($this->taxRate / 100);
        }

        return Money::from($taxAmount, $this->subtotal->currency());
    }

    public function withholdingTaxAmount(): Money
    {
        // Withholding tax calculated on subtotal (before VAT)
        $amount = $this->subtotal->amount() * ($this->withholdingTaxRate / 100);

        return Money::from($amount, $this->subtotal->currency());
    }

    public function total(): Money
    {
        if ($this->taxInclusive) {
            // Tax already included in subtotal
            $total = $this->subtotal->amount();
        } else {
            // Add tax to subtotal
            $total = $this->subtotal->amount() + $this->taxAmount()->amount();
        }

        return Money::from($total, $this->subtotal->currency());
    }

    public function netTotal(): Money
    {
        // Net = Total - Withholding Tax
        $net = $this->total()->amount() - $this->withholdingTaxAmount()->amount();

        return Money::from($net, $this->subtotal->currency());
    }

    public function subtotal(): Money
    {
        return $this->subtotal;
    }

    public function subtotalExcludingTax(): Money
    {
        if ($this->taxInclusive) {
            // Remove embedded tax from subtotal
            $amount = $this->subtotal->amount() - $this->taxAmount()->amount();

            return Money::from($amount, $this->subtotal->currency());
        }

        return $this->subtotal;
    }

    public function taxRate(): float
    {
        return $this->taxRate;
    }

    public function withholdingTaxRate(): float
    {
        return $this->withholdingTaxRate;
    }

    public function isTaxInclusive(): bool
    {
        return $this->taxInclusive;
    }

    public function breakdown(): array
    {
        return [
            'subtotal' => $this->subtotal()->amount(),
            'subtotal_excluding_tax' => $this->subtotalExcludingTax()->amount(),
            'tax_rate' => $this->taxRate,
            'tax_amount' => $this->taxAmount()->amount(),
            'withholding_tax_rate' => $this->withholdingTaxRate,
            'withholding_tax_amount' => $this->withholdingTaxAmount()->amount(),
            'total' => $this->total()->amount(),
            'net_total' => $this->netTotal()->amount(),
            'tax_inclusive' => $this->taxInclusive,
            'currency' => $this->subtotal->currency(),
        ];
    }

    public function formatted(): string
    {
        $subtotalLabel = $this->taxInclusive ? 'Subtotal (incl. tax)' : 'Subtotal';

        return sprintf(
            "%s: %s\nTax (%s%%): %s\nWithholding Tax (%s%%): -%s\nTotal: %s",
            $subtotalLabel,
            $this->subtotal->formattedWithCurrency(),
            number_format($this->taxRate, 2),
            $this->taxAmount()->formattedWithCurrency(),
            number_format($this->withholdingTaxRate, 2),
            $this->withholdingTaxAmount()->formattedWithCurrency(),
            $this->netTotal()->formattedWithCurrency()
        );
    }
}
