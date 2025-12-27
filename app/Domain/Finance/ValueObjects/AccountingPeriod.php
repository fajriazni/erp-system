<?php

namespace App\Domain\Finance\ValueObjects;

use Carbon\Carbon;
use InvalidArgumentException;

/**
 * Accounting Period Value Object
 *
 * Represents a fiscal period with status.
 */
class AccountingPeriod
{
    private function __construct(
        private readonly Carbon $startDate,
        private readonly Carbon $endDate,
        private readonly string $status
    ) {
        if ($this->endDate->isBefore($this->startDate)) {
            throw new InvalidArgumentException('End date must be after start date');
        }

        if (! in_array($status, ['open', 'closed'])) {
            throw new InvalidArgumentException('Status must be either "open" or "closed"');
        }
    }

    public static function create(Carbon $startDate, Carbon $endDate, string $status = 'open'): self
    {
        return new self($startDate, $endDate, $status);
    }

    public static function currentMonth(): self
    {
        return new self(
            now()->startOfMonth(),
            now()->endOfMonth(),
            'open'
        );
    }

    public static function currentYear(): self
    {
        return new self(
            now()->startOfYear(),
            now()->endOfYear(),
            'open'
        );
    }

    public function startDate(): Carbon
    {
        return $this->startDate->copy();
    }

    public function endDate(): Carbon
    {
        return $this->endDate->copy();
    }

    public function status(): string
    {
        return $this->status;
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }

    public function containsDate(Carbon $date): bool
    {
        return $date->isBetween($this->startDate, $this->endDate, true);
    }

    public function close(): self
    {
        return new self($this->startDate, $this->endDate, 'closed');
    }

    public function reopen(): self
    {
        return new self($this->startDate, $this->endDate, 'open');
    }

    public function getDurationInDays(): int
    {
        return $this->startDate->diffInDays($this->endDate) + 1;
    }

    public function format(): string
    {
        return $this->startDate->format('M Y');
    }

    public function equals(AccountingPeriod $other): bool
    {
        return $this->startDate->eq($other->startDate)
            && $this->endDate->eq($other->endDate);
    }
}
