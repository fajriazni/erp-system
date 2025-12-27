<?php

namespace App\Domain\Accounting\Aggregates\PostingRule;

final class PostingRuleLine
{
    public function __construct(
        private readonly ?int $id,
        private readonly int $chartOfAccountId,
        private readonly string $debitCredit,
        private readonly string $amountKey,
        private readonly ?string $descriptionTemplate = null
    ) {}

    public static function create(int $chartOfAccountId, string $debitCredit, string $amountKey, ?string $descriptionTemplate = null): self
    {
        return new self(null, $chartOfAccountId, $debitCredit, $amountKey, $descriptionTemplate);
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function chartOfAccountId(): int
    {
        return $this->chartOfAccountId;
    }

    public function debitCredit(): string
    {
        return $this->debitCredit;
    }

    public function amountKey(): string
    {
        return $this->amountKey;
    }

    public function descriptionTemplate(): ?string
    {
        return $this->descriptionTemplate;
    }
}
