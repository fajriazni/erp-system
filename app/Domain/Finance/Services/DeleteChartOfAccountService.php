<?php

namespace App\Domain\Finance\Services;

use App\Domain\Finance\Contracts\ChartOfAccountRepositoryInterface;
use App\Domain\Finance\Events\ChartOfAccountDeleted;
use App\Models\ChartOfAccount;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class DeleteChartOfAccountService
{
    public function __construct(
        private readonly ChartOfAccountRepositoryInterface $repository
    ) {}

    /**
     * Delete a chart of account
     *
     *
     * @throws InvalidArgumentException
     */
    public function execute(ChartOfAccount $account): bool
    {
        return DB::transaction(function () use ($account) {
            // Check if account has children
            if ($account->hasChildren()) {
                throw new InvalidArgumentException('Cannot delete account with sub-accounts. Please delete or reassign child accounts first.');
            }

            // Check if account is used in journal entries
            if ($this->repository->hasTransactions($account->id)) {
                throw new InvalidArgumentException('Cannot delete account that has been used in journal entries. Consider deactivating it instead.');
            }

            // Dispatch domain event before deletion
            event(new ChartOfAccountDeleted($account));

            // Delete the account
            return $account->delete();
        });
    }
}
