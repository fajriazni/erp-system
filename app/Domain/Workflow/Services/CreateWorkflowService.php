<?php

namespace App\Domain\Workflow\Services;

use App\Models\Workflow;
use App\Models\WorkflowCondition;
use App\Models\WorkflowStep;
use Illuminate\Support\Facades\DB;

class CreateWorkflowService
{
    public function execute(array $data): Workflow
    {
        return DB::transaction(function () use ($data) {
            // Create the workflow
            $workflow = Workflow::create([
                'name' => $data['name'],
                'module' => $data['module'],
                'entity_type' => $data['entity_type'],
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'created_by' => auth()->id() ?? 1,
                'version' => 1,
            ]);

            // Create steps with conditions
            foreach ($data['steps'] as $stepData) {
                $step = WorkflowStep::create([
                    'workflow_id' => $workflow->id,
                    'step_number' => $stepData['step_number'],
                    'name' => $stepData['name'],
                    'step_type' => $stepData['step_type'],
                    'config' => $stepData['config'],
                    'sla_hours' => $stepData['sla_hours'] ?? null,
                ]);

                // Create conditions if present
                if (! empty($stepData['conditions'])) {
                    foreach ($stepData['conditions'] as $conditionData) {
                        WorkflowCondition::create([
                            'workflow_step_id' => $step->id,
                            'field_path' => $conditionData['field_path'],
                            'operator' => $conditionData['operator'],
                            'value' => $conditionData['value'],
                            'logical_operator' => $conditionData['logical_operator'],
                            'group_number' => $conditionData['group_number'],
                        ]);
                    }
                }
            }

            return $workflow->load(['steps.conditions', 'creator']);
        });
    }
}
