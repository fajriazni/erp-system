<?php

namespace App\Domain\Accounting\Repositories;

use App\Domain\Accounting\Aggregates\AccountingPeriod\AccountingPeriod;

interface AccountingPeriodRepositoryInterface
{
    public function findById(int $id): ?AccountingPeriod;

    public function findByDate(\DateTimeInterface $date): ?AccountingPeriod;

    public function findOpenPeriodForDate(\DateTimeInterface $date): ?AccountingPeriod;

    public function save(AccountingPeriod $period): void;

    public function delete(int $id): void;
}
