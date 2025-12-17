<?php

namespace App\Domain\Finance\Services;

use App\Models\Budget;
use App\Models\BudgetEncumbrance;
use Illuminate\Database\Eloquent\Model;

class BudgetCheckService
{
    /**
     * Check if a department has sufficient budget for the given amount.
     */
    public function check(int $departmentId, float $amount, ?int $fiscalYear = null): BudgetCheckResult
    {
        $fiscalYear = $fiscalYear ?? date('Y');

        // Find applicable budget for department
        $budget = Budget::where('department_id', $departmentId)
            ->where('fiscal_year', $fiscalYear)
            ->where('is_active', true)
            ->first();

        if (! $budget) {
            // No budget defined - allow with info message
            return new BudgetCheckResult(
                status: 'ok',
                message: 'No budget defined for this department.',
                budget: null,
                availableAmount: null,
                requestedAmount: $amount
            );
        }

        $availableAmount = $budget->available_amount;
        $utilizationAfter = (($budget->encumbered_amount + $amount) / $budget->amount) * 100;

        // Check if would exceed budget
        if ($amount > $availableAmount) {
            if ($budget->is_strict) {
                return new BudgetCheckResult(
                    status: 'blocked',
                    message: 'Insufficient budget. Available: '.number_format($availableAmount, 2).', Requested: '.number_format($amount, 2),
                    budget: $budget,
                    availableAmount: $availableAmount,
                    requestedAmount: $amount
                );
            }

            return new BudgetCheckResult(
                status: 'warning',
                message: 'This will exceed the budget. Available: '.number_format($availableAmount, 2).', Requested: '.number_format($amount, 2),
                budget: $budget,
                availableAmount: $availableAmount,
                requestedAmount: $amount
            );
        }

        // Check if would exceed warning threshold
        if ($utilizationAfter >= $budget->warning_threshold) {
            return new BudgetCheckResult(
                status: 'warning',
                message: 'Budget utilization will reach '.number_format($utilizationAfter, 1).'% after this transaction.',
                budget: $budget,
                availableAmount: $availableAmount,
                requestedAmount: $amount
            );
        }

        return new BudgetCheckResult(
            status: 'ok',
            message: 'Budget available.',
            budget: $budget,
            availableAmount: $availableAmount,
            requestedAmount: $amount
        );
    }

    /**
     * Create an encumbrance (commitment) against a budget.
     *
     * @param  Model  $entity  (PurchaseRequest or PurchaseOrder)
     */
    public function createEncumbrance(Budget $budget, Model $entity, float $amount): BudgetEncumbrance
    {
        return BudgetEncumbrance::create([
            'budget_id' => $budget->id,
            'encumberable_type' => get_class($entity),
            'encumberable_id' => $entity->id,
            'amount' => $amount,
            'status' => 'active',
        ]);
    }

    /**
     * Release an encumbrance (when PO is received/billed).
     */
    public function releaseEncumbrance(Model $entity): void
    {
        BudgetEncumbrance::where('encumberable_type', get_class($entity))
            ->where('encumberable_id', $entity->id)
            ->where('status', 'active')
            ->update(['status' => 'released']);
    }
}
