<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handle authorization in policy
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'module' => 'required|string|max:100',
            'entity_type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',

            // Steps validation
            'steps' => 'required|array|min:1',
            'steps.*.name' => 'required|string|max:255',
            'steps.*.step_number' => 'required|integer|min:1',
            'steps.*.step_type' => 'required|in:approval,notification,conditional,parallel',
            'steps.*.sla_hours' => 'nullable|integer|min:1',

            // Config validation
            'steps.*.config' => 'required|array',
            'steps.*.config.approver_type' => 'required|in:role,user',
            'steps.*.config.approver_ids' => 'required|array|min:1',
            'steps.*.config.approver_ids.*' => 'required|integer',
            'steps.*.config.approval_type' => 'required|in:all,any_one,majority',

            // Conditions validation (optional)
            'steps.*.conditions' => 'nullable|array',
            'steps.*.conditions.*.field_path' => 'required|string',
            'steps.*.conditions.*.operator' => 'required|in:=,!=,>,<,>=,<=,in,not_in,between,contains',
            'steps.*.conditions.*.value' => 'required|array',
            'steps.*.conditions.*.logical_operator' => 'required|in:and,or',
            'steps.*.conditions.*.group_number' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'steps.required' => 'Workflow must have at least one step',
            'steps.*.config.approver_ids.required' => 'Each step must have at least one approver',
            'steps.*.config.approver_ids.min' => 'Each step must have at least one approver',
        ];
    }
}
