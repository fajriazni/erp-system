<?php

namespace App\Infrastructure\Persistence\Eloquent\Accounting;

use App\Domain\Accounting\Aggregates\AccountingPeriod\AccountingPeriod;
use App\Domain\Accounting\Repositories\AccountingPeriodRepositoryInterface;
use App\Domain\Accounting\ValueObjects\DateRange;
use App\Models\AccountingPeriod as EloquentAccountingPeriod;

final class EloquentAccountingPeriodRepository implements AccountingPeriodRepositoryInterface
{
    public function findById(int $id): ?AccountingPeriod
    {
        $model = EloquentAccountingPeriod::find($id);

        return $model ? $this->mapToDomain($model) : null;
    }

    public function findByDate(\DateTimeInterface $date): ?AccountingPeriod
    {
        $model = EloquentAccountingPeriod::forDate($date)->first();

        return $model ? $this->mapToDomain($model) : null;
    }

    public function findOpenPeriodForDate(\DateTimeInterface $date): ?AccountingPeriod
    {
        $model = EloquentAccountingPeriod::open()->forDate($date)->first();

        return $model ? $this->mapToDomain($model) : null;
    }

    public function save(AccountingPeriod $period): void
    {
        EloquentAccountingPeriod::updateOrCreate(
            ['id' => $period->id()],
            [
                'name' => $period->name(),
                'start_date' => $period->range()->startDate(),
                'end_date' => $period->range()->endDate(),
                'status' => $period->status(),
                'locked_by' => $period->lockedBy(),
                'locked_at' => $period->lockedAt(),
            ]
        );
    }

    public function delete(int $id): void
    {
        EloquentAccountingPeriod::destroy($id);
    }

    private function mapToDomain(EloquentAccountingPeriod $model): AccountingPeriod
    {
        return AccountingPeriod::reconstruct(
            $model->id,
            $model->name,
            DateRange::fromDates($model->start_date, $model->end_date),
            $model->status,
            $model->locked_by,
            $model->locked_at?->toDateTimeString()
        );
    }
}
