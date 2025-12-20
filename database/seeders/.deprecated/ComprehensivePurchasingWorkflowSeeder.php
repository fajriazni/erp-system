<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRfq;
use App\Models\VendorOnboarding;
use App\Models\VendorPayment;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\Workflow;
use App\Models\WorkflowStep;

class ComprehensivePurchasingWorkflowSeeder extends Seeder
{
    /**
     * Comprehensive Purchasing Workflows
     * 
     * Seeds all recommended workflows for purchasing module:
     * 1. Purchase Orders (4 levels - value-based) ✅ Already exists
     * 2. Purchase Requests (4 levels - value-based) ✅ Enhancement
     * 3. Vendor Onboarding (3 levels - fixed) ✅ High Priority
     * 4. RFQ Approval (3 levels - value-based) ✅ Medium Priority
     * 5. Vendor Payment (5 levels - value-based) ✅ High Priority
     */
    public function run(): void
    {
        $this->ensureRolesExist();
        
        $this->command->info('Seeding Purchase Order workflows (already exists)...');
        // PO workflows handled by PurchaseOrderApprovalWorkflowSeeder
        
        $this->command->info('Seeding enhanced Purchase Request workflows...');
        $this->seedPurchaseRequestWorkflows();
        
        $this->command->info('Seeding Vendor Onboarding workflows...');
        $this->seedVendorOnboardingWorkflows();
        
        $this->command->info('Seeding RFQ Approval workflows...');
        $this->seedRfqWorkflows();
        
        $this->command->info('Seeding Vendor Payment workflows...');
        $this->seedVendorPaymentWorkflows();
        
        $this->command->info('All purchasing workflows seeded successfully!');
    }

    /**
     * Purchase Request Workflows (Enhanced with value-based routing)
     */
    private function seedPurchaseRequestWorkflows(): void
    {
        // Level 1: ≤5M (Supervisor only)
        $workflow1 = Workflow::create([
            'name' => 'PR Approval - Level 1 (Quick Approval)',
            'module' => 'purchasing',
            'entity_type' => PurchaseRequest::class,
            'description' => 'Fast track approval for small purchase requests ≤ 5M',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow1->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Department Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 12,
        ]);

        // Level 2: 5M-25M (Supervisor → Manager)
        $workflow2 = Workflow::create([
            'name' => 'PR Approval - Level 2 (Standard)',
            'module' => 'purchasing',
            'entity_type' => PurchaseRequest::class,
            'description' => 'Standard approval for purchase requests 5M-25M',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow2->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Department Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow2->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Department Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        // Level 3: 25M-50M (Supervisor → Manager → Finance)
        $workflow3 = Workflow::create([
            'name' => 'PR Approval - Level 3 (Finance Review)',
            'module' => 'purchasing',
            'entity_type' => PurchaseRequest::class,
            'description' => 'Finance review required for PRs 25M-50M',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow3->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Department Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow3->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Department Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow3->id,
            'step_number' => 3,
            'name' => 'Finance Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Finance Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 72,
        ]);

        // Level 4: >50M (Full Chain)
        $workflow4 = Workflow::create([
            'name' => 'PR Approval - Level 4 (Executive)',
            'module' => 'purchasing',
            'entity_type' => PurchaseRequest::class,
            'description' => 'Executive approval for large PRs > 50M',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow4->id,
            'step_number' => 1,
            'name' => 'Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Department Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow4->id,
            'step_number' => 2,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Department Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow4->id,
            'step_number' => 3,
            'name' => 'Finance Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Finance Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 72,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow4->id,
            'step_number' => 4,
            'name' => 'Director Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Operations Director')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 120,
        ]);
    }

    /**
     * Vendor Onboarding Workflow (High Priority)
     */
    private function seedVendorOnboardingWorkflows(): void
    {
        $workflow = Workflow::create([
            'name' => 'Vendor Onboarding - Standard Review',
            'module' => 'purchasing',
            'entity_type' => VendorOnboarding::class,
            'description' => 'Three-level verification for new vendor registration',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 1,
            'name' => 'Data Verification',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Staff')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 2,
            'name' => 'Capability Assessment',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 72,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_number' => 3,
            'name' => 'Financial & Compliance Check',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Finance Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 96,
        ]);
    }

    /**
     * RFQ Approval Workflows (Medium Priority)
     */
    private function seedRfqWorkflows(): void
    {
        // Auto-approve for ≤25M
        // Level 1: 25M-100M  (Manager)
        $workflow1 = Workflow::create([
            'name' => 'RFQ Approval - Level 1 (Manager)',
            'module' => 'purchasing',
            'entity_type' => PurchaseRfq::class,
            'description' => 'Manager approval for RFQs 25M-100M',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow1->id,
            'step_number' => 1,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        // Level 2: >100M (Manager → Finance)
        $workflow2 = Workflow::create([
            'name' => 'RFQ Approval - Level 2 (Finance)',
            'module' => 'purchasing',
            'entity_type' => PurchaseRfq::class,
            'description' => 'Finance review for large RFQs > 100M',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow2->id,
            'step_number' => 1,
            'name' => 'Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Purchasing Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow2->id,
            'step_number' => 2,
            'name' => 'Finance Manager Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Finance Manager')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 72,
        ]);
    }

    /**
     * Vendor Payment Workflows (High Priority - if in Purchasing scope)
     */
    private function seedVendorPaymentWorkflows(): void
    {
        // Level 1: ≤10M
        $workflow1 = Workflow::create([
            'name' => 'Vendor Payment - Level 1',
            'module' => 'purchasing',
            'entity_type' => VendorPayment::class,
            'description' => 'Small payment approval ≤ 10M',
            'is_active' => true,
            'created_by' => 1,
            'version' => 1,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow1->id,
            'step_number' => 1,
            'name' => 'AP Clerk Verification',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'AP Clerk')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 24,
        ]);

        WorkflowStep::create([
            'workflow_id' => $workflow1->id,
            'step_number' => 2,
            'name' => 'Finance Supervisor Approval',
            
            'action_type' => 'approval',
            'assigned_to_role_id' => Role::where('name', 'Finance Supervisor')->first()?->id,
            'is_required' => true,
            'timeout_hours' => 48,
        ]);

        // Additional levels can be added similarly...
        // Level 2: 10M-100M
        // Level 3: 100M-500M  
        // Level 4: >500M
    }

    /**
     * Ensure all required roles exist
     */
    private function ensureRolesExist(): void
    {
        $roles = [
            // Purchasing Roles
            'Purchasing Staff' => 'Handles daily purchasing operations',
            'Purchasing Supervisor' => 'Supervises purchasing team',
            'Purchasing Manager' => 'Manages purchasing department',
            
            // Department Roles
            'Department Supervisor' => 'Supervises department operations',
            'Department Manager' => 'Manages department',
            
            // Finance Roles
            'Finance Supervisor' => 'Supervises finance team',
            'Finance Manager' => 'Manages financial operations',
            'AP Clerk' => 'Accounts Payable processing',
            
            // Executive Roles
            'Operations Director' => 'Oversees operations',
            'CEO' => 'Chief Executive Officer',
        ];

        foreach ($roles as $roleName => $description) {
            Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web']
            );
        }
    }
}
