<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class WorkflowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user as creator
        $user = User::first();

        if (! $user) {
            $this->command->warn('No users found. Please create a user first.');

            return;
        }

        // Create Purchase Order Approval Workflow
        $poWorkflow = Workflow::create([
            'name' => 'Purchase Order Approval',
            'module' => 'purchasing',
            'entity_type' => 'App\\Models\\PurchaseOrder',
            'description' => 'Multi-level approval workflow for purchase orders based on amount thresholds',
            'is_active' => true,
            'created_by' => $user->id,
            'version' => 1,
        ]);

        // Step 1: Manager Approval (for orders < 10M)
        WorkflowStep::create([
            'workflow_id' => $poWorkflow->id,
            'step_number' => 1,
            'name' => 'Manager Approval',
            'step_type' => 'approval',
            'config' => [
                'approval_type' => 'any_one',
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [2], // Assuming role ID 2 is Manager
                ],
            ],
            'sla_hours' => 24,
        ]);

        // Step 2: Director Approval (for orders >= 10M and < 50M)
        WorkflowStep::create([
            'workflow_id' => $poWorkflow->id,
            'step_number' => 2,
            'name' => 'Director Approval',
            'step_type' => 'approval',
            'config' => [
                'approval_type' => 'any_one',
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [3], // Assuming role ID 3 is Director
                ],
            ],
            'sla_hours' => 48,
        ]);

        // Step 3: CEO Approval (for orders >= 50M)
        WorkflowStep::create([
            'workflow_id' => $poWorkflow->id,
            'step_number' => 3,
            'name' => 'CEO Approval',
            'step_type' => 'approval',
            'config' => [
                'approval_type' => 'all',
                'approvers' => [
                    'type' => 'role',
                    'role_ids' => [1], // Assuming role ID 1 is CEO/Admin
                ],
            ],
            'sla_hours' => 72,
        ]);

        // Add conditions to steps for amount-based routing
        $step1 = $poWorkflow->steps()->where('step_number', 1)->first();
        $step1->conditions()->create([
            'field_path' => 'total',
            'operator' => '<',
            'value' => [10000000],
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        $step2 = $poWorkflow->steps()->where('step_number', 2)->first();
        $step2->conditions()->create([
            'field_path' => 'total',
            'operator' => '>=',
            'value' => [10000000],
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);
        $step2->conditions()->create([
            'field_path' => 'total',
            'operator' => '<',
            'value' => [50000000],
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        $step3 = $poWorkflow->steps()->where('step_number', 3)->first();
        $step3->conditions()->create([
            'field_path' => 'total',
            'operator' => '>=',
            'value' => [50000000],
            'logical_operator' => 'and',
            'group_number' => 1,
        ]);

        $this->command->info('Purchase Order Approval Workflow created successfully!');
    }
}
