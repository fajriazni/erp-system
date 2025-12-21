<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Workflow;
use App\Models\WorkflowCondition;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class VendorAuditWorkflowSeeder extends Seeder
{
    /**
     * Seed Vendor Audit workflow for supplier qualification
     *
     * Multi-step audit approval process:
     * - Step 1 (Purchasing): Initial audit planning
     * - Step 2 (Audit Team): On-site audit execution
     * - Step 3 (Quality): Technical evaluation
     * - Step 4 (Management): Final certification decision
     */
    public function run(): void
    {
        $this->ensureRolesExist();

        $this->command->info('Creating Vendor Audit approval workflow...');

        // Create ONE workflow for Vendor Audits
        $workflow = Workflow::create([
            'name' => 'Vendor Audit Approval',
            'module' => 'purchasing',
            'entity_type' => Contact::class,
            'description' => 'Comprehensive vendor qualification and audit approval process',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        // Step 1: Audit Planning (Always)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Audit Planning',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [5], // Manager
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 24,
        ]);

        // Step 2: Audit Execution (Always)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Audit Execution',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [6], // Staff (Audit Team)
                ],
                'approval_type' => 'any_one', // Any team member can execute
                'allow_self_approval' => true, // Allow self-approval for audit tasks
            ],
            'sla_hours' => 168, // 1 week for on-site audit
        ]);

        // Step 3: Quality Evaluation (Always)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Quality Evaluation',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [4], // Head Division
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 48,
        ]);

        // Step 4: Final Certification (Always)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 4,
            'name' => 'Final Certification',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [3], // Chief Officer
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 24,
        ]);

        // Conditional Step 5: Director Review (Critical findings only)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 5,
            'name' => 'Director Review',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [2], // President Director
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 48,
        ]);

        // Add condition for Step 5: Only for critical findings
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 5)
                ->first()->id,
            'field_path' => 'has_critical_findings',
            'operator' => '=',
            'value' => 'true',
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        $this->command->info('✅ Vendor Audit workflow created successfully!');
        $this->command->info('   - Step 1: Audit Planning (24h SLA)');
        $this->command->info('   - Step 2: Audit Execution (168h SLA) - 1 week');
        $this->command->info('   - Step 3: Quality Evaluation (48h SLA)');
        $this->command->info('   - Step 4: Final Certification (24h SLA)');
        $this->command->info('   - Step 5: Director Review (48h SLA) - Critical findings only');
    }

    /**
     * Ensure required roles exist for workflow assignment
     */
    protected function ensureRolesExist(): void
    {
        $requiredRoles = [
            ['name' => 'President Director', 'guard_name' => 'web'],
            ['name' => 'Chief Officer', 'guard_name' => 'web'],
            ['name' => 'Head Division', 'guard_name' => 'web'],
            ['name' => 'Manager', 'guard_name' => 'web'],
            ['name' => 'Staff', 'guard_name' => 'web'],
        ];

        foreach ($requiredRoles as $roleData) {
            \Spatie\Permission\Models\Role::firstOrCreate($roleData);
        }
    }
}
