<?php

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Accounting\Aggregates\AccountingPeriod\AccountingPeriod;
use App\Domain\Accounting\Repositories\AccountingPeriodRepositoryInterface;
use App\Models\AccountingPeriod as AccountingPeriodModel;

class EloquentAccountingPeriodRepository implements AccountingPeriodRepositoryInterface
{
    public function save(AccountingPeriod $period): void
    {
        // Direct Eloquent operations - no aggregate serialization
        $data = [
            'period' => $period->name(),
            'start_date' => $period->startDate(),
            'end_date' => $period->endDate(),
            'status' => $period->status(),
        ];

        if ($period->id()) {
            AccountingPeriodModel::where('id', $period->id())->update($data);
        } else {
            AccountingPeriodModel::create($data);
        }
    }

    public function findById(int $id): ?AccountingPeriod
    {
        $model = AccountingPeriodModel::find($id);

        return $model ? $this->modelToAggregate($model) : null;
    }

    public function findByDate(\DateTimeInterface $date): ?AccountingPeriod
    {
        $model = AccountingPeriodModel::forDate($date)->first();

        return $model ? $this->modelToAggregate($model) : null;
    }

    public function findOpenPeriodForDate(\DateTimeInterface $date): ?AccountingPeriod
    {
        $model = AccountingPeriodModel::forDate($date)
            ->where('status', 'open')
            ->first();

        return $model ? $this->modelToAggregate($model) : null;
    }

    public function delete(int $id): void
    {
        AccountingPeriodModel::where('id', $id)->delete();
    }

    private function modelToAggregate(AccountingPeriodModel $model): AccountingPeriod
    {
        return AccountingPeriod::reconstruct(
            $model->id,
            $model->period,
            new \DateTimeImmutable($model->start_date),
            new \DateTimeImmutable($model->end_date),
            $model->status
        );
    }
}
