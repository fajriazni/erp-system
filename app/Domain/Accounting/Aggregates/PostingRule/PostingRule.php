<?php

namespace App\Domain\Accounting\Aggregates\PostingRule;

final class PostingRule
{
    /** @var PostingRuleLine[] */
    private array $lines = [];

    private function __construct(
        private readonly ?int $id,
        private readonly string $eventType,
        private readonly string $description,
        private readonly string $module,
        private bool $isActive = true
    ) {}

    public static function create(string $eventType, string $description, string $module): self
    {
        return new self(null, $eventType, $description, $module, true);
    }

    public static function reconstruct(
        int $id,
        string $eventType,
        string $description,
        string $module,
        bool $isActive,
        array $lines
    ): self {
        $rule = new self($id, $eventType, $description, $module, $isActive);
        foreach ($lines as $line) {
            $rule->addLine($line);
        }

        return $rule;
    }

    public function addLine(PostingRuleLine $line): void
    {
        $this->lines[] = $line;
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function eventType(): string
    {
        return $this->eventType;
    }

    public function description(): string
    {
        return $this->description;
    }

    public function module(): string
    {
        return $this->module;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    /** @return PostingRuleLine[] */
    public function lines(): array
    {
        return $this->lines;
    }
}
