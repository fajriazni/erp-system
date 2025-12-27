<?php

namespace App\Domain\Finance\ValueObjects;

use Carbon\Carbon;
use InvalidArgumentException;
use Stringable;

/**
 * Journal Entry Number Value Object
 *
 * Generates and validates journal entry reference numbers.
 * Format: JE-YYYYMM-SEQUENCE (e.g., JE-202512-00001)
 */
class JournalEntryNumber implements Stringable
{
    private function __construct(
        private readonly string $number
    ) {
        if (! $this->isValid($number)) {
            throw new InvalidArgumentException("Invalid journal entry number format: {$number}");
        }
    }

    public static function from(string $number): self
    {
        return new self($number);
    }

    public static function generate(?Carbon $date = null): self
    {
        $date = $date ?? now();
        $yearMonth = $date->format('Ym');

        // In production, sequence should come from database
        // For now, use a random number
        $sequence = str_pad((string) rand(1, 99999), 5, '0', STR_PAD_LEFT);

        return new self("JE-{$yearMonth}-{$sequence}");
    }

    public function value(): string
    {
        return $this->number;
    }

    public function extractYearMonth(): string
    {
        // Extract YYYYMM from JE-YYYYMM-SEQUENCE
        $parts = explode('-', $this->number);

        return $parts[1] ?? '';
    }

    public function extractSequence(): string
    {
        $parts = explode('-', $this->number);

        return $parts[2] ?? '';
    }

    public function equals(JournalEntryNumber $other): bool
    {
        return $this->number === $other->number;
    }

    public function __toString(): string
    {
        return $this->number;
    }

    private function isValid(string $number): bool
    {
        // Match format: JE-YYYYMM-NNNNN
        return (bool) preg_match('/^JE-\d{6}-\d{5}$/', $number);
    }
}
