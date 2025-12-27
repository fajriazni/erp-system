<?php

namespace App\Domain\Accounting\DomainServices;

use App\Domain\Accounting\ValueObjects\DateRange;
use App\Models\AccountingPeriod;

final class PeriodValidationService
{
    public function ensureNoOverlap(DateRange $range, ?int $excludeId = null): void
    {
        $overlapping = AccountingPeriod::query()
            ->when($excludeId, fn ($query) => $query->where('id', '!=', $excludeId))
            ->where(function ($query) use ($range) {
                $start = $range->startDate();
                $end = $range->endDate();

                $query->whereBetween('start_date', [$start, $end])
                    ->orWhereBetween('end_date', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_date', '<=', $start)
                            ->where('end_date', '>=', $end);
                    });
            })
            ->exists();

        if ($overlapping) {
            throw new \DomainException('This period overlaps with an existing period.');
        }
    }
}
