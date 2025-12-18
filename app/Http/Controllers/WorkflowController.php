<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class WorkflowController extends Controller
{
    public function create()
    {
        $roles = Role::all();

        $workflowTypes = [
            [
                'id' => 'purchasing',
                'label' => 'Purchasing',
                'children' => [
                    [
                        'id' => 'App\\Models\\PurchaseRequest',
                        'label' => 'Purchase Request',
                        'module' => 'purchasing',
                    ],
                    [
                        'id' => 'App\\Models\\PurchaseRfq',
                        'label' => 'Purchase RFQ',
                        'module' => 'purchasing',
                    ],
                    [
                        'id' => 'App\\Models\\PurchaseOrder',
                        'label' => 'Purchase Order',
                        'module' => 'purchasing',
                    ],
                    [
                        'id' => 'App\\Models\\PurchaseReturn',
                        'label' => 'Purchase Return',
                        'module' => 'purchasing',
                    ],
                ],
            ],
            [
                'id' => 'finance',
                'label' => 'Finance',
                'children' => [
                    [
                        'id' => 'App\\Models\\VendorBill',
                        'label' => 'Vendor Bill',
                        'module' => 'finance',
                    ],
                    [
                        'id' => 'App\\Models\\VendorPayment',
                        'label' => 'Vendor Payment',
                        'module' => 'finance',
                    ],
                    [
                        'id' => 'App\\Models\\Budget',
                        'label' => 'Budget Adjustment',
                        'module' => 'finance',
                    ],
                ],
            ],
        ];

        return Inertia::render('Workflow/Create', [
            'roles' => $roles,
            'workflowTypes' => $workflowTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'module' => 'required|string|max:100',
            'entity_type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'steps' => 'required|array|min:1',
            'steps.*.name' => 'required|string',
            'steps.*.step_type' => 'required|string',
            'steps.*.approver_type' => 'required|string',
            'steps.*.approver_ids' => 'required|array',
            'steps.*.sla_hours' => 'nullable|integer',
        ]);

        $workflow = Workflow::create([
            'name' => $validated['name'],
            'module' => $validated['module'],
            'entity_type' => $validated['entity_type'],
            'description' => $validated['description'],
            'is_active' => true,
            'created_by' => auth()->id(),
            'version' => 1,
        ]);

        foreach ($validated['steps'] as $index => $stepData) {
            WorkflowStep::create([
                'workflow_id' => $workflow->id,
                'step_number' => $index + 1,
                'name' => $stepData['name'],
                'step_type' => $stepData['step_type'],
                'config' => [
                    'approval_type' => $stepData['approval_type'] ?? 'all',
                    'approvers' => [
                        'type' => $stepData['approver_type'],
                        'role_ids' => $stepData['approver_type'] === 'role' ? $stepData['approver_ids'] : null,
                        'user_ids' => $stepData['approver_type'] === 'user' ? $stepData['approver_ids'] : null,
                    ],
                ],
                'sla_hours' => $stepData['sla_hours'] ?? null,
            ]);
        }

        return redirect()->route('workflows.management')->with('success', 'Workflow created successfully!');
    }

    public function edit(Workflow $workflow)
    {
        $workflow->load(['steps', 'creator']);
        $roles = Role::all();

        return Inertia::render('Workflow/Edit', [
            'workflow' => $workflow,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, Workflow $workflow)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'steps' => 'required|array|min:1',
        ]);

        $workflow->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Delete existing steps and recreate
        $workflow->steps()->delete();

        foreach ($validated['steps'] as $index => $stepData) {
            WorkflowStep::create([
                'workflow_id' => $workflow->id,
                'step_number' => $index + 1,
                'name' => $stepData['name'],
                'step_type' => $stepData['step_type'],
                'config' => [
                    'approval_type' => $stepData['approval_type'] ?? 'all',
                    'approvers' => [
                        'type' => $stepData['approver_type'],
                        'role_ids' => $stepData['approver_type'] === 'role' ? $stepData['approver_ids'] : null,
                        'user_ids' => $stepData['approver_type'] === 'user' ? $stepData['approver_ids'] : null,
                    ],
                ],
                'sla_hours' => $stepData['sla_hours'] ?? null,
            ]);
        }

        return redirect()->route('workflows.management')->with('success', 'Workflow updated successfully!');
    }

    public function destroy(Workflow $workflow)
    {
        $workflow->delete();

        return redirect()->route('workflows.management')->with('success', 'Workflow deleted successfully!');
    }
}
