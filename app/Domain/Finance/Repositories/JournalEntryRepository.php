<?php

namespace App\Domain\Finance\Repositories;

use App\Domain\Finance\Contracts\JournalEntryRepositoryInterface;
use App\Domain\Finance\ValueObjects\AccountingPeriod;
use App\Models\JournalEntry;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Journal Entry Repository
 *
 * Eloquent implementation of journal entry repository.
 */
class JournalEntryRepository implements JournalEntryRepositoryInterface
{
    public function find(int $id): ?JournalEntry
    {
        return JournalEntry::with('lines.chartOfAccount')->find($id);
    }

    public function findByReferenceNumber(string $refNumber): ?JournalEntry
    {
        return JournalEntry::with('lines.chartOfAccount')
            ->where('reference_number', $refNumber)
            ->first();
    }

    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return JournalEntry::with('lines')
            ->withCount('lines')
            ->latest('date')
            ->paginate($perPage);
    }

    public function getByPeriod(AccountingPeriod $period): Collection
    {
        return JournalEntry::with('lines.chartOfAccount')
            ->whereBetween('date', [
                $period->startDate(),
                $period->endDate(),
            ])
            ->orderBy('date')
            ->orderBy('reference_number')
            ->get();
    }

    public function getByStatus(string $status): Collection
    {
        return JournalEntry::with('lines.chartOfAccount')
            ->where('status', $status)
            ->latest('date')
            ->get();
    }

    public function getDrafts(): Collection
    {
        return $this->getByStatus('draft');
    }

    public function getPosted(): Collection
    {
        return $this->getByStatus('posted');
    }

    public function save(JournalEntry $entry): void
    {
        $entry->save();
    }

    public function delete(JournalEntry $entry): void
    {
        $entry->delete();
    }
}
