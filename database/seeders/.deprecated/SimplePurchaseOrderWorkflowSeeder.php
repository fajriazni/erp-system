<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use Spatie\Permission\Models\Role;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class SimplePurchaseOrderWorkflowSeeder extends Seeder
{
    /**
     * Seed simple PO approval workflows matching actual schema
     */
    public function run(): void
    {
        $this->ensureRolesExist();
        
        $this->command->info('Seeding Purchase Order approval workflow...');
        $this->createBasicWorkflow();
        
        $this->command->info('Purchase Order workflow seeded successfully!');
    }

    /**
     * Create basic PO approval workflow
     */
    private function createBasicWorkflow(): void
    {
        $workflow = Workflow::create([
            'name' => 'PO Approval - Standard',
            'module' => 'purchasing',
            'entity_type' => PurchaseOrder::class,
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        // Step 1: Supervisor Approval
        WorkflowStep::create([
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

        // Step 2: Manager Approval
        WorkflowStep::create([
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
    }

    /**
     * Ensure all required roles exist
     */
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
