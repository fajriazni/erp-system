<?php

namespace App\Domain\Finance\Services;

class CurrencyExchangeService
{
    /**
     * Convert an amount from one currency to another.
     * Currently a simple implementation using manually provided rates or stored rates.
     */
    public function convert(float $amount, string $fromCurrency, string $toCurrency, ?float $manualRate = null): float
    {
        if ($fromCurrency === $toCurrency) {
            return $amount;
        }

        if ($manualRate) {
            return round($amount * $manualRate, 2);
        }

        // Future: Fetch latest rate from database or API
        // For now, we assume standard rate 1.0 if not provided, basically unimplemented automatic conversion
        return $amount;
    }
}
