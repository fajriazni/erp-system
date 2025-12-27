<?php

namespace App\Application\Commands;

use App\Domain\Accounting\Aggregates\JournalEntry\JournalEntry;
use App\Domain\Accounting\Aggregates\JournalEntry\JournalLine;
use App\Domain\Accounting\Repositories\AccountingPeriodRepositoryInterface;
use App\Domain\Accounting\Repositories\JournalEntryRepositoryInterface;
use App\Domain\Shared\ValueObjects\Money;
use DomainException;

final class CreateJournalEntryService
{
    public function __construct(
        private readonly JournalEntryRepositoryInterface $journalRepository,
        private readonly AccountingPeriodRepositoryInterface $periodRepository
    ) {}

    public function execute(string $date, string $description, array $lines, string $currency = 'USD'): JournalEntry
    {
        $dateTime = new \DateTimeImmutable($date);

        // 1. Validate Period
        $period = $this->periodRepository->findOpenPeriodForDate($dateTime);
        if (! $period) {
            throw new DomainException("No open accounting period found for the given date: {$date}");
        }

        // 2. Generate Number
        $number = $this->journalRepository->nextJournalNumber();

        // 3. Create Aggregate
        $journalEntry = JournalEntry::create(
            $number,
            $dateTime,
            $description,
            $period->id(),
            $currency
        );

        // 4. Add Lines
        foreach ($lines as $lineData) {
            $amount = Money::from($lineData['amount'], $lineData['currency'] ?? 'USD');

            if ($lineData['type'] === 'debit') {
                $line = JournalLine::debit($lineData['account_id'], $amount, $lineData['description'] ?? null);
            } else {
                $line = JournalLine::credit($lineData['account_id'], $amount, $lineData['description'] ?? null);
            }

            $journalEntry->addLine($line);
        }

        // 5. Balance and Post (if requested, otherwise keep as draft)
        // For now, we'll validate balance and keep as draft by default or post if valid
        $journalEntry->post(); // Enforces Invariant: Debit == Credit

        // 6. Persist
        $this->journalRepository->save($journalEntry);

        return $journalEntry;
    }
}
