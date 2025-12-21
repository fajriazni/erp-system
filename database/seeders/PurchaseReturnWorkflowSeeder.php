<?php

namespace Database\Seeders;

use App\Models\PurchaseReturn;
use App\Models\Workflow;
use App\Models\WorkflowCondition;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class PurchaseReturnWorkflowSeeder extends Seeder
{
    /**
     * Seed Purchase Return approval workflow
     *
     * Conditional approval based on return value:
     * - Step 1 (Supervisor): Always executes - initial validation
     * - Step 2 (Manager): Only if total amount >= 5M
     * - Step 3 (Finance): Only if total amount >= 20M
     */
    public function run(): void
    {
        $this->ensureRolesExist();

        $this->command->info('Creating Purchase Return approval workflow...');

        // Create ONE workflow for Purchase Returns
        $workflow = Workflow::create([
            'name' => 'Purchase Return Approval',
            'module' => 'purchasing',
            'entity_type' => PurchaseReturn::class,
            'description' => 'Conditional approval workflow for purchase returns based on return value',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        // Step 1: Supervisor (Always - no conditions)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
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

        // Step 2: Manager (Conditional: total >= 5M)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
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

        // Add condition for Step 2: total >= 5,000,000
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 2)
                ->first()->id,
            'field_path' => 'total_amount',
            'operator' => '>=',
            'value' => '5000000',
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        // Step 3: Finance (Conditional: total >= 20M)
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Finance Approval',
            'step_type' => 'approval',
            'config' => [
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [2], // President Director
                ],
                'approval_type' => 'all',
                'allow_self_approval' => false,
            ],
            'sla_hours' => 72,
        ]);

        // Add condition for Step 3: total >= 20,000,000
        WorkflowCondition::create([
            'workflow_step_id' => WorkflowStep::where('workflow_id', $workflow->id)
                ->where('step_number', 3)
                ->first()->id,
            'field_path' => 'total_amount',
            'operator' => '>=',
            'value' => '20000000',
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        $this->command->info('✅ Purchase Return workflow created successfully!');
        $this->command->info('   - Step 1: Supervisor Approval (24h SLA) - Always');
        $this->command->info('   - Step 2: Manager Approval (48h SLA) - For returns ≥ 5M');
        $this->command->info('   - Step 3: Finance Approval (72h SLA) - For returns ≥ 20M');
    }

    /**
     * Ensure required roles exist for workflow assignment
     */
    protected function ensureRolesExist(): void
    {
        $requiredRoles = [
            ['name' => 'President Director', 'guard_name' => 'web'],
            ['name' => 'Head Division', 'guard_name' => 'web'],
            ['name' => 'Manager', 'guard_name' => 'web'],
        ];

        foreach ($requiredRoles as $roleData) {
            \Spatie\Permission\Models\Role::firstOrCreate($roleData);
        }
    }
}
