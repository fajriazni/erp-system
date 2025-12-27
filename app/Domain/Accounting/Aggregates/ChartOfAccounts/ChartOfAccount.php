<?php

namespace App\Domain\Accounting\Aggregates\ChartOfAccounts;

use App\Domain\Accounting\ValueObjects\AccountCode;
use InvalidArgumentException;

/**
 * Chart of Accounts Aggregate Root
 *
 * Manages the hierarchy and properties of an account.
 */
final class ChartOfAccount
{
    private function __construct(
        private readonly int $id,
        private AccountCode $code,
        private string $name,
        private string $type,
        private bool $isCashAccount = false,
        private ?int $parentId = null,
        private bool $isActive = true
    ) {}

    public static function create(
        int $id,
        AccountCode $code,
        string $name,
        string $type,
        bool $isCashAccount = false,
        ?int $parentId = null
    ): self {
        return new self($id, $code, $name, $type, $isCashAccount, $parentId);
    }

    public static function reconstruct(
        int $id,
        AccountCode $code,
        string $name,
        string $type,
        bool $isCashAccount,
        ?int $parentId,
        bool $isActive
    ): self {
        return new self($id, $code, $name, $type, $isCashAccount, $parentId, $isActive);
    }

    public function id(): int
    {
        return $this->id;
    }

    public function code(): AccountCode
    {
        return $this->code;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function type(): string
    {
        return $this->type;
    }

    public function isCashAccount(): bool
    {
        return $this->isCashAccount;
    }

    public function parentId(): ?int
    {
        return $this->parentId;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function rename(string $newName): void
    {
        if (empty($newName)) {
            throw new InvalidArgumentException('Account name cannot be empty.');
        }
        $this->name = $newName;
    }

    public function deactivate(): void
    {
        $this->isActive = false;
    }

    public function activate(): void
    {
        $this->isActive = true;
    }
}
