<?php

namespace App\Domain\Accounting\Aggregates\AccountingPeriod;

use App\Domain\Accounting\ValueObjects\DateRange;
use InvalidArgumentException;

/**
 * Accounting Period Aggregate Root
 *
 * Manages the lifecycle of an accounting period.
 * Business Rules:
 * - Status transitions: Open -> Closed -> Locked
 * - Cannot post to Locked periods.
 */
final class AccountingPeriod
{
    private function __construct(
        private readonly int $id,
        private string $name,
        private DateRange $range,
        private string $status,
        private ?int $lockedBy = null,
        private ?string $lockedAt = null
    ) {
        if (! in_array($status, ['open', 'closed', 'locked'])) {
            throw new InvalidArgumentException("Invalid status: {$status}");
        }
    }

    public static function create(int $id, string $name, DateRange $range, string $status = 'open'): self
    {
        return new self($id, $name, $range, $status);
    }

    public static function reconstruct(
        int $id,
        string $name,
        DateRange $range,
        string $status,
        ?int $lockedBy = null,
        ?string $lockedAt = null
    ): self {
        return new self($id, $name, $range, $status, $lockedBy, $lockedAt);
    }

    public function id(): int
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function range(): DateRange
    {
        return $this->range;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }

    public function close(): void
    {
        if ($this->status === 'locked') {
            throw new \DomainException('Cannot close a locked period.');
        }
        $this->status = 'closed';
    }

    public function lock(int $userId): void
    {
        if ($this->status === 'locked') {
            return;
        }
        $this->status = 'locked';
        $this->lockedBy = $userId;
        $this->lockedAt = now()->toDateTimeString();
    }

    public function unlock(): void
    {
        $this->status = 'open';
        $this->lockedBy = null;
        $this->lockedAt = null;
    }

    public function lockedBy(): ?int
    {
        return $this->lockedBy;
    }

    public function lockedAt(): ?string
    {
        return $this->lockedAt;
    }
}
