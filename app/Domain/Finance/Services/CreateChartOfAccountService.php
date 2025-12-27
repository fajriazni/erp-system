<?php

namespace App\Domain\Finance\Services;

use App\Domain\Finance\Contracts\ChartOfAccountRepositoryInterface;
use App\Domain\Finance\Events\ChartOfAccountCreated;
use App\Domain\Finance\ValueObjects\AccountCode;
use App\Models\ChartOfAccount;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreateChartOfAccountService
{
    public function __construct(
        private readonly ChartOfAccountRepositoryInterface $repository
    ) {}

    /**
     * Create a new chart of account
     *
     * @param  array{code: string, name: string, type: string, parent_id: ?int, description: ?string, is_active: bool}  $data
     *
     * @throws InvalidArgumentException
     */
    public function execute(array $data): ChartOfAccount
    {
        return DB::transaction(function () use ($data) {
            // Validate account code format
            $accountCode = AccountCode::from($data['code']);

            // Check if code already exists
            if ($this->repository->findByCode($accountCode)) {
                throw new InvalidArgumentException("Account code {$accountCode->value()} already exists");
            }

            // Validate parent account if provided
            if (isset($data['parent_id']) && $data['parent_id']) {
                $data['parent_id'] = (int) $data['parent_id'];
                $parent = $this->repository->findById($data['parent_id']);
                if (! $parent) {
                    throw new InvalidArgumentException('Parent account not found');
                }

                // Ensure parent type matches child type
                $currentType = strtolower($data['type']);
                if ($parent->type !== $currentType) {
                    throw new InvalidArgumentException("Child account type ({$currentType}) must match parent account type ({$parent->type})");
                }
            }

            // Normalize type to lowercase
            $data['type'] = strtolower($data['type']);

            // Create the account
            $account = ChartOfAccount::create([
                'code' => $accountCode->value(),
                'name' => $data['name'],
                'type' => $data['type'],
                'parent_id' => $data['parent_id'] ?? null,
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            // Dispatch domain event
            event(new ChartOfAccountCreated($account));

            return $account;
        });
    }
}
