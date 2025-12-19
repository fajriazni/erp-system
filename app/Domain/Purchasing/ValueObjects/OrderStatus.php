<?php

namespace App\Domain\Purchasing\ValueObjects;

use InvalidArgumentException;

/**
 * OrderStatus Value Object
 * 
 * Represents the lifecycle status of a Purchase Order
 */
class OrderStatus
{
    // Status constants
    public const DRAFT = 'draft';
    public const TO_APPROVE = 'to_approve';
    public const OPEN = 'open';
    public const PARTIALLY_RECEIVED = 'partially_received';
    public const CLOSED = 'closed';
    public const CANCELLED = 'cancelled';

    private function __construct(
        private readonly string $value
    ) {
        if (!self::isValid($value)) {
            throw new InvalidArgumentException("Invalid order status: {$value}");
        }
    }

    public static function from(string $value): self
    {
        return new self($value);
    }

    public static function draft(): self
    {
        return new self(self::DRAFT);
    }

    public static function toApprove(): self
    {
        return new self(self::TO_APPROVE);
    }

    public static function open(): self
    {
        return new self(self::OPEN);
    }

    public static function partiallyReceived(): self
    {
        return new self(self::PARTIALLY_RECEIVED);
    }

    public static function closed(): self
    {
        return new self(self::CLOSED);
    }

    public static function cancelled(): self
    {
        return new self(self::CANCELLED);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function isDraft(): bool
    {
        return $this->value === self::DRAFT;
    }

    public function isToApprove(): bool
    {
        return $this->value === self::TO_APPROVE;
    }

    public function isOpen(): bool
    {
        return $this->value === self::OPEN;
    }

    public function isPartiallyReceived(): bool
    {
        return $this->value === self::PARTIALLY_RECEIVED;
    }

    public function isClosed(): bool
    {
        return $this->value === self::CLOSED;
    }

    public function isCancelled(): bool
    {
        return $this->value === self::CANCELLED;
    }

    public function canEdit(): bool
    {
        return $this->isDraft();
    }

    public function canSubmit(): bool
    {
        return $this->isDraft();
    }

    public function canApprove(): bool
    {
        return $this->isToApprove();
    }

    public function canCancel(): bool
    {
        return !$this->isCancelled() && !$this->isClosed();
    }

    public function canReceive(): bool
    {
        return $this->isOpen() || $this->isPartiallyReceived();
    }

    public function equals(OrderStatus $other): bool
    {
        return $this->value === $other->value;
    }

    public function label(): string
    {
        return match ($this->value) {
            self::DRAFT => 'Draft',
            self::TO_APPROVE => 'Pending Approval',
            self::OPEN => 'Open',
            self::PARTIALLY_RECEIVED => 'Partially Received',
            self::CLOSED => 'Closed',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function description(): string
    {
        return match ($this->value) {
            self::DRAFT => 'Masih draf kasar',
            self::TO_APPROVE => 'Menunggu tanda tangan digital',
            self::OPEN => 'Sudah dipesan ke vendor',
            self::PARTIALLY_RECEIVED => 'Baru datang sebagian',
            self::CLOSED => 'Transaksi selesai total',
            self::CANCELLED => 'PO dibatalkan',
        };
    }

    public function stockEffect(): string
    {
        return match ($this->value) {
            self::DRAFT, self::TO_APPROVE => 'Belum ada efek',
            self::OPEN => 'Expected Stock (Committed)',
            self::PARTIALLY_RECEIVED => 'Stok bertambah sebagian',
            self::CLOSED => 'Stok penuh & Hutang lunas',
            self::CANCELLED => 'Tidak ada efek',
        };
    }

    public static function isValid(string $value): bool
    {
        return in_array($value, [
            self::DRAFT,
            self::TO_APPROVE,
            self::OPEN,
            self::PARTIALLY_RECEIVED,
            self::CLOSED,
            self::CANCELLED,
        ]);
    }

    public static function all(): array
    {
        return [
            self::DRAFT,
            self::TO_APPROVE,
            self::OPEN,
            self::PARTIALLY_RECEIVED,
            self::CLOSED,
            self::CANCELLED,
        ];
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
