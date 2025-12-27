<?php

namespace App\Infrastructure\Persistence\Eloquent\Accounting;

use App\Domain\Accounting\Aggregates\PostingRule\PostingRule;
use App\Domain\Accounting\Aggregates\PostingRule\PostingRuleLine;
use App\Domain\Accounting\Repositories\PostingRuleRepositoryInterface;
use App\Models\PostingRule as EloquentPostingRule;
use Illuminate\Support\Facades\DB;

final class EloquentPostingRuleRepository implements PostingRuleRepositoryInterface
{
    public function findById(int $id): ?PostingRule
    {
        $eloquent = EloquentPostingRule::with('lines')->find($id);
        if (! $eloquent) {
            return null;
        }

        return $this->toDomain($eloquent);
    }

    public function findByEventType(string $eventType): ?PostingRule
    {
        $eloquent = EloquentPostingRule::with('lines')->where('event_type', $eventType)->first();
        if (! $eloquent) {
            return null;
        }

        return $this->toDomain($eloquent);
    }

    public function findAll(): array
    {
        return EloquentPostingRule::with('lines')
            ->get()
            ->map(fn ($e) => $this->toDomain($e))
            ->toArray();
    }

    public function save(PostingRule $rule): void
    {
        DB::transaction(function () use ($rule) {
            $eloquent = EloquentPostingRule::updateOrCreate(
                ['event_type' => $rule->eventType()],
                [
                    'description' => $rule->description(),
                    'module' => $rule->module(),
                    'is_active' => $rule->isActive(),
                ]
            );

            // Replace lines
            $eloquent->lines()->delete();

            foreach ($rule->lines() as $line) {
                $eloquent->lines()->create([
                    'chart_of_account_id' => $line->chartOfAccountId(),
                    'debit_credit' => $line->debitCredit(),
                    'amount_key' => $line->amountKey(),
                    'description_template' => $line->descriptionTemplate(),
                ]);
            }
        });
    }

    public function delete(int $id): void
    {
        EloquentPostingRule::destroy($id);
    }

    private function toDomain(EloquentPostingRule $eloquent): PostingRule
    {
        $lines = $eloquent->lines->map(function ($line) {
            return new PostingRuleLine(
                $line->id,
                $line->chart_of_account_id,
                $line->debit_credit,
                $line->amount_key,
                $line->description_template
            );
        })->toArray();

        return PostingRule::reconstruct(
            $eloquent->id,
            $eloquent->event_type,
            $eloquent->description ?? '',
            $eloquent->module ?? '',
            $eloquent->is_active,
            $lines
        );
    }
}
