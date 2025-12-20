<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use Spatie\Permission\Models\Role;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use App\Models\WorkflowCondition;
use Illuminate\Database\Seeder;

class ConditionalPurchaseOrderWorkflowSeeder extends Seeder
{
    /**
     * Seed PO workflow with conditional steps based on amount
     * 
     * Uses WorkflowConditions to determine which steps execute:
     * - Step 1 (Supervisor): Always executes
     * - Step 2 (Manager): Only if total >= 10M
     * - Step 3 (Finance): Only if total >= 50M
     * - Step 4 (CEO): Only if total >= 100M
     */
    public function run(): void
    {
        $this->ensureRolesExist();
        
        $this->command->info('Creating conditional PO approval workflow...');
        
        // Create ONE workflow
        $workflow = Workflow::create([
            'name' => 'Purchase Order Approval',
            'module' => 'purchasing',
            'entity_type' => PurchaseOrder::class,
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        // Step 1: Supervisor (Always - no conditions)
        $supervisorStep = WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            'step_type' => 'approval',
            'config' => [
                'assigned_to_role' => 'Purchasing Supervisor',
                'is_required' => true,
            ],
            'sla_hours' => 24,
        ]);
        // No conditions = always executes

        // Step 2: Manager (Only if total >= 10M)
        $managerStep = WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
            'step_type' => 'approval',
            'config' => [
                'assigned_to_role' => 'Purchasing Manager',
                'is_required' => true,
            ],
            'sla_hours' => 48,
        ]);
        
        WorkflowCondition::create([
            'workflow_step_id' => $managerStep->id,
            'field_path' => 'total',
            'operator' => '>=',
            'value' => [10_000_000], // 10 million
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        // Step 3: Finance (Only if total >= 50M)
        $financeStep = WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Finance Manager Approval',
            'step_type' => 'approval',
            'config' => [
                'assigned_to_role' => 'Finance Manager',
                'is_required' => true,
            ],
            'sla_hours' => 72,
        ]);
        
        WorkflowCondition::create([
            'workflow_step_id' => $financeStep->id,
            'field_path' => 'total',
            'operator' => '>=',
            'value' => [50_000_000], // 50 million
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        // Step 4: CEO (Only if total >= 100M)
        $ceoStep = WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 4,
            'name' => 'CEO Approval',
            'step_type' => 'approval',
            'config' => [
                'assigned_to_role' => 'CEO',
                'is_required' => true,
            ],
            'sla_hours' => 120,
        ]);
        
        WorkflowCondition::create([
            'workflow_step_id' => $ceoStep->id,
            'field_path' => 'total',
            'operator' => '>=',
            'value' => [100_000_000], // 100 million
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        $this->command->info('Conditional workflow created successfully!');
        $this->command->info('Workflow Logic:');
        $this->command->info('  < 10M:  Supervisor only');
        $this->command->info('  10-50M: Supervisor → Manager');
        $this->command->info('  50-100M: Supervisor → Manager → Finance');
        $this->command->info('  > 100M: Supervisor → Manager → Finance → CEO');
    }

    private function ensureRolesExist(): void
    {
        $roles = [
            'Purchasing Supervisor',
            'Purchasing Manager',
            'Finance Manager',
            'CEO',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web']
            );
        }
    }
}
