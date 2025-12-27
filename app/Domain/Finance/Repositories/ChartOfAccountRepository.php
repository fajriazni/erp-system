<?php

namespace App\Domain\Finance\Repositories;

use App\Domain\Finance\Contracts\ChartOfAccountRepositoryInterface;
use App\Domain\Finance\ValueObjects\AccountCode;
use App\Domain\Finance\ValueObjects\AccountingPeriod;
use App\Domain\Finance\ValueObjects\Money;
use App\Models\ChartOfAccount;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Chart of Account Repository
 *
 * Eloquent implementation of chart of accounts repository.
 */
class ChartOfAccountRepository implements ChartOfAccountRepositoryInterface
{
    public function find(int $id): ?ChartOfAccount
    {
        return ChartOfAccount::find($id);
    }

    public function findById(int $id): ?ChartOfAccount
    {
        return $this->find($id);
    }

    public function findByCode(AccountCode $code): ?ChartOfAccount
    {
        return ChartOfAccount::where('code', (string) $code)->first();
    }

    public function getActive(): Collection
    {
        return ChartOfAccount::where('is_active', true)
            ->orderBy('code')
            ->get();
    }

    public function getByType(string $type): Collection
    {
        return ChartOfAccount::where('type', $type)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();
    }

    public function getAssets(): Collection
    {
        return $this->getByType('asset');
    }

    public function getLiabilities(): Collection
    {
        return $this->getByType('liability');
    }

    public function getRevenues(): Collection
    {
        return $this->getByType('revenue');
    }

    public function getExpenses(): Collection
    {
        return $this->getByType('expense');
    }

    public function getBalance(ChartOfAccount $account, AccountingPeriod $period): Money
    {
        $balance = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.chart_of_account_id', $account->id)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [
                $period->startDate(),
                $period->endDate(),
            ])
            ->sum(DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        // Reverse sign for liability, equity, and revenue accounts
        if (in_array($account->type, ['liability', 'equity', 'revenue'])) {
            $balance = -$balance;
        }

        return Money::from(abs($balance), 'USD');
    }

    public function hasTransactions(int $accountId): bool
    {
        return DB::table('journal_entry_lines')
            ->where('chart_of_account_id', $accountId)
            ->exists();
    }

    public function getHierarchyTree(): Collection
    {
        return ChartOfAccount::with('children')
            ->whereNull('parent_id')
            ->orderBy('code')
            ->get();
    }
}
