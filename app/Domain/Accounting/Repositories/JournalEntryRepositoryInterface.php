<?php

namespace App\Domain\Accounting\Repositories;

use App\Domain\Accounting\Aggregates\JournalEntry\JournalEntry;

interface JournalEntryRepositoryInterface
{
    public function findById(int $id): ?JournalEntry;

    public function findByNumber(string $number): ?JournalEntry;

    public function save(JournalEntry $entry): void;

    public function delete(int $id): void;

    public function nextJournalNumber(): string;
}
