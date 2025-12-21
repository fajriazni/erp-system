<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Workflow;
use App\Models\WorkflowCondition;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class VendorClaimWorkflowSeeder extends Seeder
{
    /**
     * Seed Vendor Claims workflow for vendor dispute management
     *
     * Multi-step claims approval process:
     * - Step 1 (Supervisor): Initial claim validation
     * - Step 2 (Manager): Medium-high value claims review
     * - Step 3 (Finance): High value financial claims
     * - Step 4 (Director): Critical/reputational risk claims
     */
    public function run(): void
    {
        $this->ensureRolesExist();

        $this->command->info('Creating Vendor Claims approval workflow...');

        // Create ONE workflow for Vendor Claims
        $workflow = Workflow::create([
            'name' => 'Vendor Claims Approval',
            'module' => 'purchasing',
            'entity_type' => Contact::class,
            'description' => 'Multi-level approval for vendor claims and disputes based on value and risk',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        // Step 1: Supervisor Validation (Always - initial review)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Initial Validation',
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

        // Step 2: Manager Review (Conditional: claim amount >= 10M)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Manager Review',
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

        // Add condition for Step 2: claim_amount >= 10M
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 2)
                ->first()->id,
            'field_path' => 'claim_amount',
            'operator' => '>=',
            'value' => '10000000',
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        // Step 3: Finance Review (Conditional: claim amount >= 25M)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Finance Review',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [3], // Chief Officer
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 72,
        ]);

        // Add condition for Step 3: claim_amount >= 25M
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 3)
                ->first()->id,
            'field_path' => 'claim_amount',
            'operator' => '>=',
            'value' => '25000000',
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        // Step 4: Director Approval (Conditional: high risk or amount >= 50M)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 4,
            'name' => 'Director Approval',
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

        // Add multiple conditions for Step 4 (OR logic with groups)
        // Group 1: High value claim >= 50M
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 4)
                ->first()->id,
            'field_path' => 'claim_amount',
            'operator' => '>=',
            'value' => '50000000',
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        // Group 2: High risk claim
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 4)
                ->first()->id,
            'field_path' => 'is_high_risk',
            'operator' => '=',
            'value' => 'true',
            'logical_operator' => 'and',
            'group_number' => 2,
        ]);

        // Group 3: Reputational risk claim
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 4)
                ->first()->id,
            'field_path' => 'affects_reputation',
            'operator' => '=',
            'value' => 'true',
            'logical_operator' => 'and',
            'group_number' => 3,
        ]);

        $this->command->info('✅ Vendor Claims workflow created successfully!');
        $this->command->info('   - Step 1: Initial Validation (24h SLA) - Always');
        $this->command->info('   - Step 2: Manager Review (48h SLA) - Claims ≥ 10M');
        $this->command->info('   - Step 3: Finance Review (72h SLA) - Claims ≥ 25M');
        $this->command->info('   - Step 4: Director Approval (48h SLA) - Claims ≥ 50M OR High Risk');
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
        ];

        foreach ($requiredRoles as $roleData) {
            \Spatie\Permission\Models\Role::firstOrCreate($roleData);
        }
    }
}
