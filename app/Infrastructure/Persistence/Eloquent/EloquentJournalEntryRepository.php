<?php

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Accounting\Aggregates\JournalEntry\JournalEntry;
use App\Domain\Accounting\Repositories\JournalEntryRepositoryInterface;
use App\Models\JournalEntry as JournalEntryModel;

class EloquentJournalEntryRepository implements JournalEntryRepositoryInterface
{
    public function save(JournalEntry $entry): void
    {
        // Save using direct Eloquent operations
        $data = [
            'number' => $entry->number(),
            'date' => $entry->date()->format('Y-m-d'),
            'description' => $entry->description(),
            'status' => $entry->status(),
            'period_id' => $entry->periodId(),
            'currency' => $entry->currency(),
        ];

        if ($entry->id()) {
            $model = JournalEntryModel::findOrFail($entry->id());
            $model->update($data);
        } else {
            $model = JournalEntryModel::create($data);
        }

        // Save lines
        if ($entry->id() || $model->id) {
            $modelId = $entry->id() ?? $model->id;
            // Delete existing lines and recreate
            \App\Models\JournalEntryLine::where('journal_entry_id', $modelId)->delete();

            foreach ($entry->lines() as $line) {
                \App\Models\JournalEntryLine::create([
                    'journal_entry_id' => $modelId,
                    'chart_of_account_id' => $line->chartOfAccountId(),
                    'debit' => $line->getDebit()->amount(),
                    'credit' => $line->getCredit()->amount(),
                    'description' => $line->description(),
                ]);
            }
        }
    }

    public function findById(int $id): ?JournalEntry
    {
        $model = JournalEntryModel::with('lines')->find($id);

        return $model ? $this->modelToAggregate($model) : null;
    }

    public function findByNumber(string $number): ?JournalEntry
    {
        $model = JournalEntryModel::with('lines')
            ->where('number', $number)
            ->first();

        return $model ? $this->modelToAggregate($model) : null;
    }

    public function delete(int $id): void
    {
        JournalEntryModel::where('id', $id)->delete();
    }

    public function nextJournalNumber(): string
    {
        $year = now()->year;
        $month = now()->format('m');
        $prefix = "JE-{$year}{$month}-";

        $lastEntry = JournalEntryModel::where('number', 'like', $prefix.'%')
            ->orderByDesc('number')
            ->first();

        if (! $lastEntry) {
            return $prefix.'0001';
        }

        $lastNumber = (int) substr($lastEntry->number, -4);
        $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return $prefix.$nextNumber;
    }

    private function modelToAggregate(JournalEntryModel $model): JournalEntry
    {
        $lines = $model->lines->map(function ($line) {
            return \App\Domain\Accounting\Aggregates\JournalEntry\JournalLine::reconstruct(
                $line->id,
                $line->chart_of_account_id,
                \App\Domain\Shared\ValueObjects\Money::from($line->debit ?? 0, 'IDR'),
                \App\Domain\Shared\ValueObjects\Money::from($line->credit ?? 0, 'IDR'),
                $line->description
            );
        })->toArray();

        return JournalEntry::reconstruct(
            $model->id,
            $model->number,
            new \DateTimeImmutable($model->date),
            $model->description,
            $model->status,
            $model->period_id,
            $lines,
            $model->currency ?? 'IDR'
        );
    }
}
