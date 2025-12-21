<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class WorkflowController extends Controller
{
    public function create()
    {
        $roles = Role::all();
        $users = \App\Models\User::select('id', 'name', 'email')->get();

        // Create method workflow types
        $workflowTypes = [
            [
                'id' => 'purchasing',
                'label' => 'Purchasing',
                'children' => [
                    [
                        'id' => 'App\\Models\\PurchaseRequest',
                        'label' => 'Purchase Request',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'estimated_total', 'label' => 'Estimated Total', 'type' => 'number'],
                            ['value' => 'requester.id', 'label' => 'Requester ID', 'type' => 'number'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
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
                        'fields' => [
                            ['value' => 'total', 'label' => 'Total Amount', 'type' => 'number'],
                            ['value' => 'subtotal', 'label' => 'Subtotal', 'type' => 'number'],
                            ['value' => 'tax_amount', 'label' => 'Tax Amount', 'type' => 'number'],
                            ['value' => 'vendor.id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\PurchaseReturn',
                        'label' => 'Purchase Return',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'total_amount', 'label' => 'Total Amount', 'type' => 'number'],
                            ['value' => 'vendor.id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'reason', 'label' => 'Return Reason', 'type' => 'string'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\VendorOnboarding',
                        'label' => 'Vendor Onboarding',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'type', 'label' => 'Vendor Type', 'type' => 'string'],
                            ['value' => 'credit_limit', 'label' => 'Credit Limit', 'type' => 'number'],
                            ['value' => 'is_high_risk', 'label' => 'High Risk Vendor', 'type' => 'boolean'],
                            ['value' => 'payment_terms', 'label' => 'Payment Terms', 'type' => 'string'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\VendorAudit',
                        'label' => 'Vendor Audit',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'vendor_id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'audit_type', 'label' => 'Audit Type', 'type' => 'string'],
                            ['value' => 'score', 'label' => 'Audit Score', 'type' => 'number'],
                            ['value' => 'has_critical_findings', 'label' => 'Has Critical Findings', 'type' => 'boolean'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\VendorClaim',
                        'label' => 'Vendor Claims',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'vendor_id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'claim_type', 'label' => 'Claim Type', 'type' => 'string'],
                            ['value' => 'claim_amount', 'label' => 'Claim Amount', 'type' => 'number'],
                            ['value' => 'is_high_risk', 'label' => 'High Risk', 'type' => 'boolean'],
                            ['value' => 'affects_reputation', 'label' => 'Affects Reputation', 'type' => 'boolean'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
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
            'users' => $users,
            'workflowTypes' => $workflowTypes,
        ]);
    }

    public function store(\App\Http\Requests\StoreWorkflowRequest $request)
    {
        $service = app(\App\Domain\Workflow\Services\CreateWorkflowService::class);

        $workflow = $service->execute($request->validated());

        return redirect()->route('workflows.management')->with('success', 'Workflow created successfully!');
    }

    public function edit(Workflow $workflow)
    {
        $workflow->load(['steps.conditions', 'creator']);
        $roles = Role::all();
        $users = \App\Models\User::select('id', 'name', 'email')->get();

        // Edit method workflow types
        $workflowTypes = [
            [
                'id' => 'purchasing',
                'label' => 'Purchasing',
                'children' => [
                    [
                        'id' => 'App\\Models\\PurchaseRequest',
                        'label' => 'Purchase Request',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'estimated_total', 'label' => 'Estimated Total', 'type' => 'number'],
                            ['value' => 'requester.id', 'label' => 'Requester ID', 'type' => 'number'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
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
                        'fields' => [
                            ['value' => 'total', 'label' => 'Total Amount', 'type' => 'number'],
                            ['value' => 'subtotal', 'label' => 'Subtotal', 'type' => 'number'],
                            ['value' => 'tax_amount', 'label' => 'Tax Amount', 'type' => 'number'],
                            ['value' => 'vendor.id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\PurchaseReturn',
                        'label' => 'Purchase Return',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'total_amount', 'label' => 'Total Amount', 'type' => 'number'],
                            ['value' => 'vendor.id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'reason', 'label' => 'Return Reason', 'type' => 'string'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\VendorOnboarding',
                        'label' => 'Vendor Onboarding',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'type', 'label' => 'Vendor Type', 'type' => 'string'],
                            ['value' => 'credit_limit', 'label' => 'Credit Limit', 'type' => 'number'],
                            ['value' => 'is_high_risk', 'label' => 'High Risk Vendor', 'type' => 'boolean'],
                            ['value' => 'payment_terms', 'label' => 'Payment Terms', 'type' => 'string'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\VendorAudit',
                        'label' => 'Vendor Audit',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'vendor_id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'audit_type', 'label' => 'Audit Type', 'type' => 'string'],
                            ['value' => 'score', 'label' => 'Audit Score', 'type' => 'number'],
                            ['value' => 'has_critical_findings', 'label' => 'Has Critical Findings', 'type' => 'boolean'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
                    ],
                    [
                        'id' => 'App\\Models\\VendorClaim',
                        'label' => 'Vendor Claims',
                        'module' => 'purchasing',
                        'fields' => [
                            ['value' => 'vendor_id', 'label' => 'Vendor ID', 'type' => 'number'],
                            ['value' => 'claim_type', 'label' => 'Claim Type', 'type' => 'string'],
                            ['value' => 'claim_amount', 'label' => 'Claim Amount', 'type' => 'number'],
                            ['value' => 'is_high_risk', 'label' => 'High Risk', 'type' => 'boolean'],
                            ['value' => 'affects_reputation', 'label' => 'Affects Reputation', 'type' => 'boolean'],
                            ['value' => 'status', 'label' => 'Status', 'type' => 'string'],
                        ],
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

        return Inertia::render('Workflow/Edit', [
            'workflow' => $workflow,
            'roles' => $roles,
            'users' => $users,
            'workflowTypes' => $workflowTypes,
        ]);
    }

    public function update(\App\Http\Requests\StoreWorkflowRequest $request, Workflow $workflow)
    {
        $service = app(\App\Domain\Workflow\Services\UpdateWorkflowService::class);

        $workflow = $service->execute($workflow, $request->validated());

        return redirect()->route('workflows.management')->with('success', 'Workflow updated successfully!');
    }

    public function destroy(Workflow $workflow)
    {
        $workflow->delete();

        return redirect()->route('workflows.management')->with('success', 'Workflow deleted successfully!');
    }
}
