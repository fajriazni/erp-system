<?php

namespace App\Infrastructure\Persistence\Eloquent\Accounting;

use App\Domain\Accounting\Aggregates\ChartOfAccounts\ChartOfAccount;
use App\Domain\Accounting\Repositories\ChartOfAccountsRepositoryInterface;
use App\Domain\Accounting\ValueObjects\AccountCode;
use App\Models\ChartOfAccount as EloquentChartOfAccount;

final class EloquentChartOfAccountsRepository implements ChartOfAccountsRepositoryInterface
{
    public function findById(int $id): ?ChartOfAccount
    {
        $model = EloquentChartOfAccount::find($id);

        return $model ? $this->mapToDomain($model) : null;
    }

    public function findByCode(AccountCode $code): ?ChartOfAccount
    {
        $model = EloquentChartOfAccount::where('code', (string) $code)->first();

        return $model ? $this->mapToDomain($model) : null;
    }

    public function save(ChartOfAccount $account): void
    {
        EloquentChartOfAccount::updateOrCreate(
            ['id' => $account->id()],
            [
                'code' => (string) $account->code(),
                'name' => $account->name(),
                'type' => $account->type(),
                'parent_id' => $account->parentId(),
                'is_active' => $account->isActive(),
            ]
        );
    }

    public function delete(int $id): void
    {
        EloquentChartOfAccount::destroy($id);
    }

    private function mapToDomain(EloquentChartOfAccount $model): ChartOfAccount
    {
        return ChartOfAccount::reconstruct(
            $model->id,
            AccountCode::from($model->code),
            $model->name,
            $model->type,
            false, // isCashAccount logic can be added to model if needed
            $model->parent_id,
            $model->is_active
        );
    }
}
