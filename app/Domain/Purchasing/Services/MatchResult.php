<?php

namespace App\Domain\Purchasing\Services;

/**
 * Result object for 3-way matching operations.
 */
readonly class MatchResult
{
    public function __construct(
        public string $status, // 'matched', 'exception'
        public array $exceptions = [],
    ) {}

    public function isMatched(): bool
    {
        return $this->status === 'matched';
    }

    public function hasExceptions(): bool
    {
        return count($this->exceptions) > 0;
    }

    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'exceptions' => $this->exceptions,
        ];
    }
}
