<?php

namespace App\Domain\Accounting\Aggregates\ChartOfAccounts;

use App\Domain\Accounting\ValueObjects\AccountCode;
use App\Models\ChartOfAccount as ChartOfAccountModel;
use DomainException;

class Account
{
    private ?int $id;

    private AccountCode $code;

    private string $name;

    private string $type;

    private ?int $parentId;

    private bool $isActive;

    private function __construct(
        ?int $id,
        AccountCode $code,
        string $name,
        string $type,
        ?int $parentId,
        bool $isActive
    ) {
        $this->id = $id;
        $this->code = $code;
        $this->name = $name;
        $this->type = $type;
        $this->parentId = $parentId;
        $this->isActive = $isActive;
    }

    public static function create(
        AccountCode $code,
        string $name,
        string $type,
        ?int $parentId = null
    ): self {
        return new self(
            id: null,
            code: $code,
            name: $name,
            type: $type,
            parentId: $parentId,
            isActive: true
        );
    }

    public static function fromEloquentModel(ChartOfAccountModel $model): self
    {
        return new self(
            id: $model->id,
            code: AccountCode::fromString($model->code),
            name: $model->name,
            type: $model->type,
            parentId: $model->parent_id,
            isActive: $model->is_active ?? true
        );
    }

    public function toEloquentModel(): ChartOfAccountModel
    {
        $model = $this->id
            ? ChartOfAccountModel::findOrFail($this->id)
            : new ChartOfAccountModel;

        $model->code = $this->code->toString();
        $model->name = $this->name;
        $model->type = $this->type;
        $model->parent_id = $this->parentId;
        $model->is_active = $this->isActive;

        return $model;
    }

    /**
     * Domain method: Deactivate account
     */
    public function deactivate(): void
    {
        if (! $this->isActive) {
            throw new DomainException('Account is already inactive');
        }

        $this->isActive = false;
    }

    /**
     * Domain method: Activate account
     */
    public function activate(): void
    {
        if ($this->isActive) {
            throw new DomainException('Account is already active');
        }

        $this->isActive = true;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): AccountCode
    {
        return $this->code;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getParentId(): ?int
    {
        return $this->parentId;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }
}
