<?php

namespace App\Application\Commands;

use App\Domain\Accounting\Aggregates\JournalEntry\JournalEntry;
use App\Domain\Accounting\Aggregates\JournalEntry\JournalLine;
use App\Domain\Accounting\Repositories\AccountingPeriodRepositoryInterface;
use App\Domain\Accounting\Repositories\JournalEntryRepositoryInterface;
use App\Domain\Shared\ValueObjects\Money;
use DomainException;

/**
 * Beginning Balance Wizard Service
 *
 * Helps in setting up the initial state of the ledger.
 */
final class SetBeginningBalanceService
{
    public function __construct(
        private readonly JournalEntryRepositoryInterface $journalRepository,
        private readonly AccountingPeriodRepositoryInterface $periodRepository
    ) {}

    public function execute(string $date, array $balances): JournalEntry
    {
        $dateTime = new \DateTimeImmutable($date);

        $period = $this->periodRepository->findOpenPeriodForDate($dateTime);
        if (! $period) {
            throw new DomainException("No open accounting period found for beginning balance date: {$date}");
        }

        $journalEntry = JournalEntry::create(
            'BAL-INIT-'.$dateTime->format('Y'),
            $dateTime,
            'Beginning Balance Initialization '.$dateTime->format('Y'),
            $period->id()
        );

        foreach ($balances as $lineData) {
            $money = Money::from((float) $lineData['amount'], 'USD');

            if ($lineData['type'] === 'debit') {
                $line = JournalLine::debit($lineData['chart_of_account_id'], $money, 'Initial Balance');
            } else {
                $line = JournalLine::credit($lineData['chart_of_account_id'], $money, 'Initial Balance');
            }

            $journalEntry->addLine($line);
        }

        // Note: For beginning balances, we often have a balancing account (like Retained Earnings or a suspense account)
        // if the provided balances don't sum to zero. For now, we'll enforce the invariant.

        $journalEntry->post();
        $this->journalRepository->save($journalEntry);

        return $journalEntry;
    }
}
