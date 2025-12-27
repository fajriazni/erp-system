<?php

namespace App\Domain\Accounting\Repositories;

use App\Domain\Accounting\Aggregates\PostingRule\PostingRule;

interface PostingRuleRepositoryInterface
{
    public function findById(int $id): ?PostingRule;

    public function findByEventType(string $eventType): ?PostingRule;

    /** @return PostingRule[] */
    public function findAll(): array;

    public function save(PostingRule $rule): void;

    public function delete(int $id): void;
}
