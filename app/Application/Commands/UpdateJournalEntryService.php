<?php

namespace App\Application\Commands;

use App\Domain\Accounting\Aggregates\JournalEntry\JournalEntry;
use App\Domain\Accounting\Aggregates\JournalEntry\JournalLine;
use App\Domain\Accounting\Repositories\AccountingPeriodRepositoryInterface;
use App\Domain\Accounting\Repositories\JournalEntryRepositoryInterface;
use App\Domain\Shared\ValueObjects\Money;
use DomainException;

final class UpdateJournalEntryService
{
    public function __construct(
        private readonly JournalEntryRepositoryInterface $journalRepository,
        private readonly AccountingPeriodRepositoryInterface $periodRepository
    ) {}

    public function execute(int $id, string $date, string $description, array $lines, string $currency = 'USD'): JournalEntry
    {
        $dateTime = new \DateTimeImmutable($date);

        // 1. Find existing
        $existingEntry = $this->journalRepository->findById($id);
        if (! $existingEntry) {
            throw new DomainException("Journal Entry with ID {$id} not found.");
        }

        if ($existingEntry->status() === 'posted') {
            throw new DomainException('Cannot update a posted journal entry.');
        }

        // 2. Validate Period (if date changed)
        $period = $this->periodRepository->findOpenPeriodForDate($dateTime);
        if (! $period) {
            throw new DomainException("No open accounting period found for the given date: {$date}");
        }

        // 3. Reconstruct Aggregate with new data
        // For simplicity in a draft update, we'll create a new aggregate instance with the same ID and number
        $updatedEntry = JournalEntry::reconstruct(
            $id,
            $existingEntry->number(),
            $dateTime,
            $description,
            'draft',
            $period->id(),
            [], // Start with empty lines
            $currency
        );

        // 4. Add new lines
        foreach ($lines as $lineData) {
            $amount = Money::from($lineData['amount'], $currency);

            if ($lineData['type'] === 'debit') {
                $line = JournalLine::debit($lineData['account_id'], $amount, $lineData['description'] ?? null);
            } else {
                $line = JournalLine::credit($lineData['account_id'], $amount, $lineData['description'] ?? null);
            }

            $updatedEntry->addLine($line);
        }

        // 5. Post (if valid balance)
        $updatedEntry->post();

        // 6. Persist
        $this->journalRepository->save($updatedEntry);

        return $updatedEntry;
    }
}
