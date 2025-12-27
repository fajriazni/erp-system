<?php

namespace App\Domain\Accounting\ValueObjects;

use Carbon\Carbon;
use InvalidArgumentException;

/**
 * Date Range Value Object
 *
 * Ensures immutability and valid range for accounting dates.
 */
final class DateRange
{
    private function __construct(
        private readonly Carbon $startDate,
        private readonly Carbon $endDate
    ) {
        if ($this->endDate->isBefore($this->startDate)) {
            throw new InvalidArgumentException('End date cannot be before start date');
        }
    }

    public static function fromStrings(string $start, string $end): self
    {
        return new self(Carbon::parse($start), Carbon::parse($end));
    }

    public static function fromDates(Carbon $start, Carbon $end): self
    {
        return new self($start->copy(), $end->copy());
    }

    public function startDate(): Carbon
    {
        return $this->startDate->copy();
    }

    public function endDate(): Carbon
    {
        return $this->endDate->copy();
    }

    public function contains(Carbon $date): bool
    {
        return $date->isBetween($this->startDate, $this->endDate, true);
    }

    public function equals(DateRange $other): bool
    {
        return $this->startDate->eq($other->startDate) && $this->endDate->eq($other->endDate);
    }

    public function durationInDays(): int
    {
        return $this->startDate->diffInDays($this->endDate) + 1;
    }
}
