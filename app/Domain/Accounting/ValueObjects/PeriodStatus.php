<?php

namespace App\Domain\Accounting\ValueObjects;

enum PeriodStatus: string
{
    case OPEN = 'open';
    case LOCKED = 'locked';
    case ARCHIVED = 'archived';

    public function isOpen(): bool
    {
        return $this === self::OPEN;
    }

    public function isLocked(): bool
    {
        return $this === self::LOCKED;
    }

    public function isArchived(): bool
    {
        return $this === self::ARCHIVED;
    }

    public function canTransition(PeriodStatus $newStatus): bool
    {
        return match ($this) {
            self::OPEN => $newStatus === self::LOCKED,
            self::LOCKED => in_array($newStatus, [self::OPEN, self::ARCHIVED]),
            self::ARCHIVED => false, // Cannot transition from archived
        };
    }
}
