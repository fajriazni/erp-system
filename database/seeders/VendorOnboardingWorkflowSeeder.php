<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Workflow;
use App\Models\WorkflowCondition;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class VendorOnboardingWorkflowSeeder extends Seeder
{
    /**
     * Seed Vendor Onboarding workflow for supplier registration approval
     *
     * Multi-step approval process for new vendor registration:
     * - Step 1 (Admin): Initial document validation
     * - Step 2 (Purchasing): Commercial evaluation
     * - Step 3 (Finance): Financial assessment
     * - Step 4 (Director): Final approval (for high-risk vendors)
     */
    public function run(): void
    {
        $this->ensureRolesExist();

        $this->command->info('Creating Vendor Onboarding approval workflow...');

        // Create ONE workflow for vendor onboarding
        $workflow = Workflow::create([
            'name' => 'Vendor Onboarding Approval',
            'module' => 'purchasing',
            'entity_type' => Contact::class,
            'description' => 'Multi-step approval process for new vendor registration and qualification',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        // Step 1: Admin Review (Always - no conditions)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Admin Review',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [1], // Super Admin
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 48, // 2 business days
        ]);

        // Step 2: Purchasing Review (Always)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Purchasing Evaluation',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [2], // President Director / Chief Officer
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 72, // 3 business days
        ]);

        // Step 3: Finance Review (Always)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Financial Assessment',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [2], // President Director / Chief Officer
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 72, // 3 business days
        ]);

        // Step 4: Director Approval (Conditional - Only for vendors marked as high-risk)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 4,
            'name' => 'Director Final Approval',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [2], // President Director
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 24, // 1 business day
        ]);

        // Add condition for Step 4: Only execute for high-risk vendors
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 4)
                ->first()->id,
            'field_path' => 'is_high_risk',
            'operator' => '=',
            'value' => 'true',
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        // Add auto-approval rule for low-risk vendors (skip step 4)
        WorkflowStep::where('workflow_id', $workflow->id)
            ->where('step_number', 3)
            ->update([
                'config' => array_merge(
                    WorkflowStep::where('workflow_id', $workflow->id)
                        ->where('step_number', 3)
                        ->first()
                        ->config,
                    [
                        'auto_approval_rules' => [
                            [
                                'field' => 'is_high_risk',
                                'operator' => '=',
                                'value' => 'false',
                            ],
                        ],
                    ]
                ),
            ]);

        $this->command->info('✅ Vendor Onboarding workflow created successfully!');
        $this->command->info('   - Step 1: Admin Review (48h SLA)');
        $this->command->info('   - Step 2: Purchasing Evaluation (72h SLA)');
        $this->command->info('   - Step 3: Financial Assessment (72h SLA)');
        $this->command->info('   - Step 4: Director Approval (24h SLA, high-risk only)');
    }

    /**
     * Ensure required roles exist for workflow assignment
     */
    protected function ensureRolesExist(): void
    {
        $requiredRoles = [
            ['name' => 'Super Admin', 'guard_name' => 'web'],
            ['name' => 'President Director', 'guard_name' => 'web'],
        ];

        foreach ($requiredRoles as $roleData) {
            \Spatie\Permission\Models\Role::firstOrCreate($roleData);
        }
    }
}
