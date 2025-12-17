<?php

namespace App\Domain\Finance\Services;

use App\Models\Budget;

/**
 * Result object for budget check operations.
 */
readonly class BudgetCheckResult
{
    public function __construct(
        public string $status, // 'ok', 'warning', 'blocked'
        public string $message,
        public ?Budget $budget,
        public ?float $availableAmount,
        public float $requestedAmount,
    ) {}

    public function isOk(): bool
    {
        return $this->status === 'ok';
    }

    public function isWarning(): bool
    {
        return $this->status === 'warning';
    }

    public function isBlocked(): bool
    {
        return $this->status === 'blocked';
    }

    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'message' => $this->message,
            'available_amount' => $this->availableAmount,
            'requested_amount' => $this->requestedAmount,
            'budget_id' => $this->budget?->id,
        ];
    }
}
