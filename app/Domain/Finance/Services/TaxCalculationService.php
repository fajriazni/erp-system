<?php

namespace App\Domain\Finance\Services;

class TaxCalculationService
{
    /**
     * Calculate purchase tax amounts (PPN and Withholding Tax)
     *
     * @param  float  $subtotal  Base amount before tax
     * @param  float  $taxRate  Tax rate percentage (e.g., 11 for 11% PPN)
     * @param  float  $withholdingRate  Withholding tax rate percentage (e.g., 2 for 2% PPh 23)
     * @param  bool  $taxInclusive  Whether the subtotal includes tax already
     * @return array Tax calculation results
     */
    public function calculatePurchaseTax(
        float $subtotal,
        float $taxRate = 11.0,
        float $withholdingRate = 0.0,
        bool $taxInclusive = false
    ): array {
        // If tax inclusive, extract the base amount from the total
        if ($taxInclusive && $taxRate > 0) {
            $subtotal = $subtotal / (1 + ($taxRate / 100));
        }

        $taxAmount = $subtotal * ($taxRate / 100);
        $withholdingAmount = $subtotal * ($withholdingRate / 100);
        $total = $subtotal + $taxAmount;
        $netPayable = $total - $withholdingAmount;

        return [
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($taxAmount, 2),
            'withholding_tax_amount' => round($withholdingAmount, 2),
            'total' => round($total, 2),
            'net_payable' => round($netPayable, 2),
        ];
    }

    /**
     * Calculate tax for individual item
     *
     * @param  float  $quantity  Item quantity
     * @param  float  $unitPrice  Price per unit
     * @param  float  $taxRate  Tax rate percentage
     * @return array Item tax calculation
     */
    public function calculateItemTax(
        float $quantity,
        float $unitPrice,
        float $taxRate = 0.0
    ): array {
        $subtotal = $quantity * $unitPrice;
        $taxAmount = $subtotal * ($taxRate / 100);
        $total = $subtotal + $taxAmount;

        return [
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($taxAmount, 2),
            'total' => round($total, 2),
        ];
    }

    /**
     * Recalculate totals from items with tax
     *
     * @param  array  $items  Array of items, each with quantity, unit_price, tax_rate
     * @param  float  $documentTaxRate  Document-level tax rate (PPN)
     * @param  float  $withholdingRate  Document-level withholding rate (PPh)
     * @return array Calculated totals
     */
    public function calculateFromItems(
        array $items,
        float $documentTaxRate = 0.0,
        float $withholdingRate = 0.0
    ): array {
        $subtotal = 0;

        foreach ($items as $item) {
            $itemSubtotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
            $subtotal += $itemSubtotal;
        }

        return $this->calculatePurchaseTax(
            $subtotal,
            $documentTaxRate,
            $withholdingRate,
            false
        );
    }
}
