<?php

namespace App\Domain\Finance\Contracts;

use App\Domain\Finance\ValueObjects\AccountCode;
use App\Domain\Finance\ValueObjects\AccountingPeriod;
use App\Domain\Finance\ValueObjects\Money;
use App\Models\ChartOfAccount;
use Illuminate\Support\Collection;

/**
 * Chart of Account Repository Interface
 *
 * Defines contract for chart of accounts data operations.
 */
interface ChartOfAccountRepositoryInterface
{
    /**
     * Find account by ID
     */
    public function find(int $id): ?ChartOfAccount;

    /**
     * Alias for find()
     */
    public function findById(int $id): ?ChartOfAccount;

    /**
     * Find account by code
     */
    public function findByCode(AccountCode $code): ?ChartOfAccount;

    /**
     * Get all active accounts
     */
    public function getActive(): Collection;

    /**
     * Get accounts by type
     */
    public function getByType(string $type): Collection;

    /**
     * Get asset accounts
     */
    public function getAssets(): Collection;

    /**
     * Get liability accounts
     */
    public function getLiabilities(): Collection;

    /**
     * Get revenue accounts
     */
    public function getRevenues(): Collection;

    /**
     * Get expense accounts
     */
    public function getExpenses(): Collection;

    /**
     * Get account balance for a period
     */
    public function getBalance(ChartOfAccount $account, AccountingPeriod $period): Money;

    /**
     * Check if account has transactions
     */
    public function hasTransactions(int $accountId): bool;

    /**
     * Get hierarchy tree with children
     */
    public function getHierarchyTree(): Collection;
}
