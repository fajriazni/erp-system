<?php

namespace App\Domain\Finance\Services;

use App\Domain\Finance\Contracts\ChartOfAccountRepositoryInterface;
use App\Domain\Finance\Events\ChartOfAccountUpdated;
use App\Domain\Finance\ValueObjects\AccountCode;
use App\Models\ChartOfAccount;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class UpdateChartOfAccountService
{
    public function __construct(
        private readonly ChartOfAccountRepositoryInterface $repository
    ) {}

    /**
     * Update an existing chart of account
     *
     * @param  array{code?: string, name?: string, type?: string, parent_id?: ?int, description?: ?string, is_active?: bool}  $data
     *
     * @throws InvalidArgumentException
     */
    public function execute(ChartOfAccount $account, array $data): ChartOfAccount
    {
        return DB::transaction(function () use ($account, $data) {
            $originalData = $account->toArray();

            // Validate account code if changing
            if (isset($data['code']) && $data['code'] !== $account->code) {
                $accountCode = AccountCode::from($data['code']);

                // Check if new code already exists
                $existing = $this->repository->findByCode($accountCode);
                if ($existing && $existing->id !== $account->id) {
                    throw new InvalidArgumentException("Account code {$accountCode->value()} already exists");
                }

                $data['code'] = $accountCode->value();
            }

            // Validate parent account if providing it
            if (array_key_exists('parent_id', $data)) {
                // Normalize empty string to null (though middleware should handle this)
                if (is_string($data['parent_id']) && trim($data['parent_id']) === '') {
                    $data['parent_id'] = null;
                }

                if ($data['parent_id'] !== null) {
                    $data['parent_id'] = (int) $data['parent_id'];

                    // Prevent self-reference
                    if ($data['parent_id'] === $account->id) {
                        throw new InvalidArgumentException('Account cannot be its own parent');
                    }

                    $parent = $this->repository->findById($data['parent_id']);
                    if (! $parent) {
                        throw new InvalidArgumentException('Parent account not found');
                    }

                    // Prevent circular reference
                    if ($this->wouldCreateCircularReference($account, $parent)) {
                        throw new InvalidArgumentException('This parent selection would create a circular reference');
                    }

                    // Ensure type compatibility
                    $currentType = isset($data['type']) ? strtolower($data['type']) : $account->type;
                    if ($parent->type !== $currentType) {
                        throw new InvalidArgumentException("Child account type ({$currentType}) must match parent account type ({$parent->type})");
                    }
                }
            }

            // Normalize type if provided
            if (isset($data['type'])) {
                $data['type'] = strtolower($data['type']);
            }

            // Update the account
            $account->update($data);

            // Calculate changes
            $changes = array_diff_assoc($account->toArray(), $originalData);

            // Dispatch domain event if there were changes
            if (! empty($changes)) {
                event(new ChartOfAccountUpdated($account, $changes));
            }

            return $account->fresh();
        });
    }

    /**
     * Check if setting this parent would create a circular reference
     */
    private function wouldCreateCircularReference(ChartOfAccount $account, ChartOfAccount $newParent): bool
    {
        $current = $newParent;

        while ($current) {
            if ($current->id === $account->id) {
                return true;
            }
            $current = $current->parent;
        }

        return false;
    }
}
