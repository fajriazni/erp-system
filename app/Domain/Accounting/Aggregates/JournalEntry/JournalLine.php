<?php

namespace App\Domain\Accounting\Aggregates\JournalEntry;

use App\Domain\Shared\ValueObjects\Money;
use InvalidArgumentException;

/**
 * Journal Line Entity
 *
 * Represents a single line item in a journal entry.
 */
final class JournalLine
{
    private function __construct(
        private readonly int $chartOfAccountId,
        private readonly Money $debit,
        private readonly Money $credit,
        private readonly ?string $description = null,
        private readonly ?int $id = null
    ) {
        if (! $debit->isZero() && ! $credit->isZero()) {
            throw new InvalidArgumentException('A journal line cannot have both debit and credit values.');
        }
        if ($debit->isZero() && $credit->isZero()) {
            throw new InvalidArgumentException('A journal line must have either a debit or a credit value.');
        }
    }

    public static function debit(int $chartOfAccountId, Money $amount, ?string $description = null): self
    {
        return new self($chartOfAccountId, $amount, Money::zero($amount->currency()), $description);
    }

    public static function credit(int $chartOfAccountId, Money $amount, ?string $description = null): self
    {
        return new self($chartOfAccountId, Money::zero($amount->currency()), $amount, $description);
    }

    public static function reconstruct(int $id, int $chartOfAccountId, Money $debit, Money $credit, ?string $description = null): self
    {
        return new self($chartOfAccountId, $debit, $credit, $description, $id);
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function chartOfAccountId(): int
    {
        return $this->chartOfAccountId;
    }

    public function getDebit(): Money
    {
        return $this->debit;
    }

    public function getCredit(): Money
    {
        return $this->credit;
    }

    public function description(): ?string
    {
        return $this->description;
    }
}
