<?php

namespace App\Domain\Workflow\Services;

use App\Models\WorkflowStep;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class ConditionEvaluator
{
    /**
     * Evaluate if a step's conditions are met for the given entity
     */
    public function evaluateStepConditions(WorkflowStep $step, Model $entity): bool
    {
        $conditions = $step->conditions;

        // No conditions means step always applies
        if ($conditions->isEmpty()) {
            return true;
        }

        // Group conditions by group_number
        $groups = $conditions->groupBy('group_number');

        // Evaluate each group (groups are OR'd together)
        foreach ($groups as $groupConditions) {
            if ($this->evaluateConditionGroup($groupConditions, $entity)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Evaluate a group of conditions (AND logic within group)
     */
    protected function evaluateConditionGroup($conditions, Model $entity): bool
    {
        foreach ($conditions as $condition) {
            if (! $this->evaluateCondition($condition, $entity)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate a single condition
     */
    protected function evaluateCondition($condition, Model $entity): bool
    {
        $fieldValue = $this->getFieldValue($entity, $condition->field_path);
        $conditionValue = $condition->value;
        $operator = $condition->operator;

        return match ($operator) {
            '=' => $fieldValue == $conditionValue,
            '!=' => $fieldValue != $conditionValue,
            '>' => $fieldValue > $conditionValue,
            '<' => $fieldValue < $conditionValue,
            '>=' => $fieldValue >= $conditionValue,
            '<=' => $fieldValue <= $conditionValue,
            'in' => in_array($fieldValue, (array) $conditionValue),
            'not_in' => ! in_array($fieldValue, (array) $conditionValue),
            'between' => $fieldValue >= $conditionValue[0] && $fieldValue <= $conditionValue[1],
            'contains' => str_contains((string) $fieldValue, (string) $conditionValue),
            default => false,
        };
    }

    /**
     * Get field value from entity using dot notation
     */
    protected function getFieldValue(Model $entity, string $fieldPath): mixed
    {
        $parts = explode('.', $fieldPath);
        $value = $entity;

        foreach ($parts as $part) {
            if (! $value) {
                return null;
            }

            if (is_object($value)) {
                $value = $value->$part ?? null;
            } elseif (is_array($value)) {
                $value = Arr::get($value, $part);
            } else {
                return null;
            }
        }

        return $value;
    }
}
