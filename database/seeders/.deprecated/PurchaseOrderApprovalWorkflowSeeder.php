<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class PurchaseOrderApprovalWorkflowSeeder extends Seeder
{
    /**
     * Seed the 4-level Purchase Order approval workflows
     */
    public function run(): void
    {
        // Ensure roles exist
        $this->ensureRolesExist();

        // Create 4 approval workflows
        $this->createLevel1Workflow();
        $this->createLevel2Workflow();
        $this->createLevel3Workflow();
        $this->createLevel4Workflow();
    }

    /**
     * Create Level 1 Workflow (≤10M): Supervisor only
     */
    private function createLevel1Workflow(): void
    {
        $workflow = Workflow::create([
            'name' => 'PO Approval - Level 1 (Supervisor)',
            'module' => 'purchasing',
            'entity_type' => PurchaseOrder::class,
            'description' => 'Single-level approval for PO ≤ 10 million IDR',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);
    }

    /**
     * Create Level 2 Workflow (10M-50M): Supervisor → Manager
     */
    private function createLevel2Workflow(): void
    {
        $workflow = Workflow::create([
            'name' => 'PO Approval - Level 2 (Manager)',
            'module' => 'purchasing',
            'entity_type' => PurchaseOrder::class,
            'description' => 'Two-level approval for PO between 10-50 million IDR',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);
    }

    /**
     * Create Level 3 Workflow (50M-100M): Supervisor → Manager → Finance Manager
     */
    private function createLevel3Workflow(): void
    {
        $workflow = Workflow::create([
            'name' => 'PO Approval - Level 3 (Finance)',
            'module' => 'purchasing',
            'entity_type' => PurchaseOrder::class,
            'description' => 'Three-level approval for PO between 50-100 million IDR',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Finance Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Finance Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 72,
        ]);
    }

    /**
     * Create Level 4 Workflow (>100M): Supervisor → Manager → Finance → CEO
     */
    private function createLevel4Workflow(): void
    {
        $workflow = Workflow::create([
            'name' => 'PO Approval - Level 4 (CEO)',
            'module' => 'purchasing',
            'entity_type' => PurchaseOrder::class,
            'description' => 'Four-level approval for PO > 100 million IDR',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Finance Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Finance Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 72,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 4,
            'name' => 'CEO Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'CEO')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 120, // 5 days
        ]);
    }

    /**
     * Ensure all required roles exist
     */
    private function ensureRolesExist(): void
    {
        $roles = [
            'Purchasing Supervisor' => 'Manages purchasing operations',
            'Purchasing Manager' => 'Oversees purchasing department',
            'Finance Manager' => 'Manages financial approvals',
            'CEO' => 'Chief Executive Officer',
        ];

        foreach ($roles as $roleName => $description) {
            Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web']
            );
        }
    }
}
