<?php

namespace App\Domain\Finance\Services;

use App\Models\ExchangeRate;
use Exception;
use Illuminate\Database\Eloquent\Builder;

class CurrencyService
{
    /**
     * Get the exchange rate between two currencies for a specific date.
     * Use latest available rate on or before the date.
     */
    public function getRate(string $fromCurrency, string $toCurrency, ?string $date = null): ?float
    {
        if ($fromCurrency === $toCurrency) {
            return 1.0;
        }

        $date = $date ?? now()->toDateString();

        $rateRecord = ExchangeRate::where('from_currency', $fromCurrency)
            ->where('to_currency', $toCurrency)
            ->whereDate('effective_date', '<=', $date)
            ->orderBy('effective_date', 'desc')
            ->first();

        // If direct rate not found, try inverse? (Optional logic, sticking to direct for now)
        // Or if base currency is involved, we could triangulate. 
        // For MVP, simplistic lookup.

        return $rateRecord ? (float) $rateRecord->rate : null;
    }

    /**
     * Convert an amount from one currency to another.
     */
    public function convert(float $amount, string $fromCurrency, string $toCurrency, ?string $date = null): float
    {
        if ($fromCurrency === $toCurrency) {
            return $amount;
        }

        $date = $date ?? now()->toDateString();
        $rate = $this->getRate($fromCurrency, $toCurrency, $date);

        if (!$rate) {
            // Try inverse
            $inverseRate = $this->getRate($toCurrency, $fromCurrency, $date);
            if ($inverseRate && $inverseRate > 0) {
                 return round($amount / $inverseRate, 2);
            }
            
            throw new Exception("Exchange rate not found for {$fromCurrency} to {$toCurrency} on or before {$date}");
        }

        return round($amount * $rate, 2);
    }
}
