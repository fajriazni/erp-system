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

        // Get available roles
        $roles = \Spatie\Permission\Models\Role::pluck('name', 'id')->toArray();

        if (empty($roles)) {
            $this->command->warn('No roles found. Please create roles first.');

            return;
        }

        $this->command->info('Available roles: '.implode(', ', $roles));

        // Get role IDs for workflow assignment
        // Prefer: Super Admin/Admin (1) > Manager (2) > Director (3)
        $adminRoleId = collect($roles)->search(fn ($name) => str_contains(strtolower($name), 'admin'));
        $managerRoleId = collect($roles)->search(fn ($name) => str_contains(strtolower($name), 'manager'));
        $directorRoleId = collect($roles)->search(fn ($name) => str_contains(strtolower($name), 'director'));

        // Fallback to first available role
        $defaultRoleId = $adminRoleId ?: array_key_first($roles);

        $this->command->info("Using roles - Admin: {$adminRoleId}, Manager: {$managerRoleId}, Director: {$directorRoleId}, Default: {$defaultRoleId}");

        // Create Purchase Order Approval Workflow
        $poWorkflow = Workflow::firstOrCreate(
            ['name' => 'Purchase Order Approval'],
            [
                'module' => 'purchasing',
                'entity_type' => 'App\\Models\\PurchaseOrder',
                'description' => 'Approval workflow for purchase orders',
                'is_active' => true,
                'created_by' => $user->id,
                'version' => 1,
            ]
        );

        if ($poWorkflow->wasRecentlyCreated) {
            // Single step approval - assign to admin/manager/first available role
            $approverRoleId = $managerRoleId ?: $adminRoleId ?: $defaultRoleId;

            WorkflowStep::create([
                'workflow_id' => $poWorkflow->id,
                'step_number' => 1,
                'name' => 'Approval',
                'step_type' => 'approval',
                'config' => [
                    'approval_type' => 'any_one',
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$approverRoleId],
                    ],
                ],
                'sla_hours' => 24,
            ]);

            $this->command->info("✓ Purchase Order Approval Workflow created (Approver: Role {$approverRoleId})");
        } else {
            $this->command->info('Purchase Order Approval Workflow already exists.');
        }

        // Create Purchase Request Approval Workflow
        $prWorkflow = Workflow::firstOrCreate(
            ['name' => 'Purchase Request Approval'],
            [
                'module' => 'purchasing',
                'entity_type' => 'App\\Models\\PurchaseRequest',
                'description' => 'Approval workflow for purchase requests',
                'is_active' => true,
                'created_by' => $user->id,
                'version' => 1,
            ]
        );

        if ($prWorkflow->wasRecentlyCreated) {
            $approverRoleId = $managerRoleId ?: $adminRoleId ?: $defaultRoleId;

            WorkflowStep::create([
                'workflow_id' => $prWorkflow->id,
                'step_number' => 1,
                'name' => 'Approval',
                'step_type' => 'approval',
                'config' => [
                    'approval_type' => 'any_one',
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$approverRoleId],
                    ],
                ],
                'sla_hours' => 24,
            ]);

            $this->command->info("✓ Purchase Request Approval Workflow created (Approver: Role {$approverRoleId})");
        } else {
            $this->command->info('Purchase Request Approval Workflow already exists.');
        }

        // Create RFQ Approval Workflow (if RFQ model exists)
        if (class_exists('App\\Models\\Rfq')) {
            $rfqWorkflow = Workflow::firstOrCreate(
                ['name' => 'RFQ Approval'],
                [
                    'module' => 'purchasing',
                    'entity_type' => 'App\\Models\\Rfq',
                    'description' => 'Approval workflow for request for quotations',
                    'is_active' => true,
                    'created_by' => $user->id,
                    'version' => 1,
                ]
            );

            if ($rfqWorkflow->wasRecentlyCreated) {
                $approverRoleId = $managerRoleId ?: $adminRoleId ?: $defaultRoleId;

                WorkflowStep::create([
                    'workflow_id' => $rfqWorkflow->id,
                    'step_number' => 1,
                    'name' => 'Approval',
                    'step_type' => 'approval',
                    'config' => [
                        'approval_type' => 'any_one',
                        'approvers' => [
                            'type' => 'role',
                            'role_ids' => [$approverRoleId],
                        ],
                    ],
                    'sla_hours' => 24,
                ]);

                $this->command->info("✓ RFQ Approval Workflow created (Approver: Role {$approverRoleId})");
            } else {
                $this->command->info('RFQ Approval Workflow already exists.');
            }
        }

        $this->command->info("\n✅ Workflow seeding completed!");
    }
}
