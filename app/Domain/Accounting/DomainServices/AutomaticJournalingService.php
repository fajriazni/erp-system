<?php

namespace App\Domain\Accounting\DomainServices;

use App\Application\Commands\CreateJournalEntryService;
use App\Domain\Accounting\Repositories\ChartOfAccountsRepositoryInterface;
use App\Domain\Accounting\ValueObjects\AccountCode;
use DomainException;

/**
 * Automatic Journaling Domain Service
 *
 * Orchestrates journal creation from external events via ACL data.
 */
final class AutomaticJournalingService
{
    public function __construct(
        private readonly CreateJournalEntryService $createJournalService,
        private readonly ChartOfAccountsRepositoryInterface $coaRepository
    ) {}

    public function process(array $aclData): void
    {
        $lines = [];

        foreach ($aclData['lines'] as $lineData) {
            $accountCode = AccountCode::from($lineData['account_code']);
            $account = $this->coaRepository->findByCode($accountCode);

            if (! $account) {
                throw new DomainException("Account with code {$lineData['account_code']} not found for automatic journaling.");
            }

            $lines[] = [
                'account_id' => $account->id(),
                'amount' => $lineData['amount'],
                'type' => $lineData['type'],
                'description' => $lineData['description'] ?? null,
            ];
        }

        $this->createJournalService->execute(
            $aclData['date'],
            $aclData['description'],
            $lines
        );
    }
}
