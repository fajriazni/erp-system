<?php

namespace App\Domain\Finance\Contracts;

use App\Domain\Finance\ValueObjects\AccountingPeriod;
use App\Models\JournalEntry;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Journal Entry Repository Interface
 *
 * Defines contract for journal entry data operations.
 */
interface JournalEntryRepositoryInterface
{
    /**
     * Find journal entry by ID
     */
    public function find(int $id): ?JournalEntry;

    /**
     * Find journal entry by reference number
     */
    public function findByReferenceNumber(string $refNumber): ?JournalEntry;

    /**
     * Get all journal entries paginated
     */
    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator;

    /**
     * Get journal entries for a specific period
     */
    public function getByPeriod(AccountingPeriod $period): Collection;

    /**
     * Get journal entries by status
     */
    public function getByStatus(string $status): Collection;

    /**
     * Get draft journal entries
     */
    public function getDrafts(): Collection;

    /**
     * Get posted journal entries
     */
    public function getPosted(): Collection;

    /**
     * Save journal entry
     */
    public function save(JournalEntry $entry): void;

    /**
     * Delete journal entry
     */
    public function delete(JournalEntry $entry): void;
}
