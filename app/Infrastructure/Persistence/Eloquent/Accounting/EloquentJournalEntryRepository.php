<?php

namespace App\Infrastructure\Persistence\Eloquent\Accounting;

use App\Domain\Accounting\Aggregates\JournalEntry\JournalEntry;
use App\Domain\Accounting\Aggregates\JournalEntry\JournalLine;
use App\Domain\Accounting\Repositories\JournalEntryRepositoryInterface;
use App\Domain\Shared\ValueObjects\Money;
use App\Models\JournalEntry as EloquentJournalEntry;
use Illuminate\Support\Facades\DB;

final class EloquentJournalEntryRepository implements JournalEntryRepositoryInterface
{
    public function findById(int $id): ?JournalEntry
    {
        $model = EloquentJournalEntry::with('lines')->find($id);

        return $model ? $this->mapToDomain($model) : null;
    }

    public function findByNumber(string $number): ?JournalEntry
    {
        $model = EloquentJournalEntry::with('lines')->where('reference_number', $number)->first();

        return $model ? $this->mapToDomain($model) : null;
    }

    public function save(JournalEntry $entry): void
    {
        DB::transaction(function () use ($entry) {
            $model = EloquentJournalEntry::updateOrCreate(
                ['id' => $entry->id()],
                [
                    'reference_number' => $entry->number(),
                    'date' => $entry->date()->format('Y-m-d H:i:s'),
                    'description' => $entry->description(),
                    'status' => $entry->status(),
                    // No currency_code in Aggregate yet, defaulting to USD or null
                ]
            );

            // Sync lines
            $model->lines()->delete();
            foreach ($entry->lines() as $line) {
                $model->lines()->create([
                    'chart_of_account_id' => $line->chart_of_account_id(),
                    'debit' => $line->debit()->amount(),
                    'credit' => $line->credit()->amount(),
                    'description' => $line->description(),
                ]);
            }
        });
    }

    public function delete(int $id): void
    {
        EloquentJournalEntry::destroy($id);
    }

    public function nextJournalNumber(): string
    {
        $datePrefix = now()->format('Ym');
        $lastEntry = EloquentJournalEntry::where('reference_number', 'like', "GL-{$datePrefix}-%")
            ->orderBy('reference_number', 'desc')
            ->first();

        if (! $lastEntry) {
            return "GL-{$datePrefix}-0001";
        }

        $lastNumber = (int) substr($lastEntry->reference_number, -4);
        $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return "GL-{$datePrefix}-{$nextNumber}";
    }

    private function mapToDomain(EloquentJournalEntry $model): JournalEntry
    {
        $lines = $model->lines->map(function ($line) {
            return JournalLine::reconstruct(
                $line->id,
                $line->chart_of_account_id,
                Money::from($line->debit, 'USD'), // Default to USD for now
                Money::from($line->credit, 'USD'),
                $line->description
            );
        })->toArray();

        return JournalEntry::reconstruct(
            $model->id,
            $model->reference_number,
            \DateTimeImmutable::createFromMutable($model->date),
            $model->description,
            $model->status,
            $model->id, // period_id placeholder, needs proper mapping if available
            $lines
        );
    }
}
