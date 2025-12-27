<?php

namespace App\Domain\Accounting\Aggregates\JournalEntry;

use App\Domain\Shared\ValueObjects\Money;
use DomainException;

/**
 * Journal Entry Aggregate Root
 *
 * Enforces the primary accounting invariant: Total Debit = Total Credit.
 */
final class JournalEntry
{
    /** @var JournalLine[] */
    private array $lines = [];

    private function __construct(
        private readonly ?int $id,
        private readonly string $number,
        private readonly \DateTimeImmutable $date,
        private readonly string $description,
        private readonly string $currency = 'USD',
        private string $status = 'draft',
        private readonly ?int $periodId = null
    ) {}

    public static function create(string $number, \DateTimeImmutable $date, string $description, int $periodId, string $currency = 'USD'): self
    {
        return new self(null, $number, $date, $description, $currency, 'draft', $periodId);
    }

    public static function reconstruct(
        int $id,
        string $number,
        \DateTimeImmutable $date,
        string $description,
        string $status,
        int $periodId,
        array $lines,
        string $currency = 'USD'
    ): self {
        $entry = new self($id, $number, $date, $description, $currency, $status, $periodId);
        foreach ($lines as $line) {
            $entry->addLine($line);
        }

        return $entry;
    }

    public function addLine(JournalLine $line): void
    {
        if ($this->status === 'posted') {
            throw new DomainException('Cannot add lines to a posted journal entry.');
        }

        if ($line->getDebit()->currency() !== $this->currency && $line->getCredit()->currency() !== $this->currency) {
            throw new DomainException("Currency mismatch: expected {$this->currency}");
        }

        $this->lines[] = $line;
    }

    public function post(): void
    {
        if ($this->status === 'posted') {
            return;
        }

        $this->validateBalance();
        $this->status = 'posted';
    }

    public function void(): void
    {
        if ($this->status === 'posted') {
            throw new DomainException('Cannot void a posted journal entry. Use reversal instead.');
        }
        $this->status = 'void';
    }

    private function validateBalance(): void
    {
        if (empty($this->lines)) {
            throw new DomainException('Journal entry must have at least two lines.');
        }

        $totalDebit = Money::zero($this->currency);
        $totalCredit = Money::zero($this->currency);

        foreach ($this->lines as $line) {
            $totalDebit = $totalDebit->add($line->getDebit());
            $totalCredit = $totalCredit->add($line->getCredit());
        }

        if (! $totalDebit->equals($totalCredit)) {
            throw new DomainException(
                sprintf(
                    'Journal entry is not balanced. Total Debit: %s, Total Credit: %s',
                    $totalDebit->format(),
                    $totalCredit->format()
                )
            );
        }
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function number(): string
    {
        return $this->number;
    }

    public function getReferenceNumber(): string
    {
        return $this->number;
    }

    public function date(): \DateTimeImmutable
    {
        return $this->date;
    }

    public function description(): string
    {
        return $this->description;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function periodId(): ?int
    {
        return $this->periodId;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    /** @return JournalLine[] */
    public function lines(): array
    {
        return $this->lines;
    }

    /** @return JournalLine[] */
    public function getLines(): array
    {
        return $this->lines;
    }

    public function isBalanced(): bool
    {
        if (empty($this->lines)) {
            return false;
        }

        $totalDebit = Money::zero($this->currency);
        $totalCredit = Money::zero($this->currency);

        foreach ($this->lines as $line) {
            $totalDebit = $totalDebit->add($line->getDebit());
            $totalCredit = $totalCredit->add($line->getCredit());
        }

        return $totalDebit->equals($totalCredit);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPosted(): bool
    {
        return $this->status === 'posted';
    }
}
