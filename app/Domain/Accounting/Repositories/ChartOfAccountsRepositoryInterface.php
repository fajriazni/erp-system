<?php

namespace App\Domain\Accounting\Repositories;

use App\Domain\Accounting\Aggregates\ChartOfAccounts\ChartOfAccount;
use App\Domain\Accounting\ValueObjects\AccountCode;

interface ChartOfAccountsRepositoryInterface
{
    public function findById(int $id): ?ChartOfAccount;

    public function findByCode(AccountCode $code): ?ChartOfAccount;

    public function save(ChartOfAccount $account): void;

    public function delete(int $id): void;
}
