<?php

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Accounting\Aggregates\ChartOfAccounts\ChartOfAccount;
use App\Domain\Accounting\Repositories\ChartOfAccountsRepositoryInterface;
use App\Domain\Accounting\ValueObjects\AccountCode;
use App\Models\ChartOfAccount as ChartOfAccountModel;

class EloquentChartOfAccountsRepository implements ChartOfAccountsRepositoryInterface
{
    public function save(ChartOfAccount $account): void
    {
        $data = [
            'code' => $account->code()->toString(),
            'name' => $account->name(),
            'type' => $account->type(),
            'parent_id' => $account->parentId(),
            'is_active' => $account->isActive(),
            'is_cash_account' => $account->isCashAccount(),
        ];

        ChartOfAccountModel::updateOrCreate(
            ['id' => $account->id()],
            $data
        );
    }

    public function findById(int $id): ?ChartOfAccount
    {
        $model = ChartOfAccountModel::find($id);

        return $model ? $this->modelToAggregate($model) : null;
    }

    public function findByCode(AccountCode $code): ?ChartOfAccount
    {
        $model = ChartOfAccountModel::where('code', $code->toString())->first();

        return $model ? $this->modelToAggregate($model) : null;
    }

    public function delete(int $id): void
    {
        ChartOfAccountModel::where('id', $id)->delete();
    }

    private function modelToAggregate(ChartOfAccountModel $model): ChartOfAccount
    {
        return ChartOfAccount::reconstruct(
            $model->id,
            AccountCode::fromString($model->code),
            $model->name,
            $model->type,
            $model->is_cash_account ?? false,
            $model->parent_id,
            $model->is_active ?? true
        );
    }
}
