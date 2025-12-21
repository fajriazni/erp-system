<?php

namespace Database\Seeders;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\BlanketOrder;
use App\Models\Contact;
use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class BlanketOrderWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (! $user) {
            $this->command->error('No user found.');

            return;
        }

        // 1. Ensure Role exists and user has it
        $roleName = 'Super Admin';
        $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        if (! $user->hasRole($roleName)) {
            $user->assignRole($role);
        }

        // 2. Create/Update Workflow
        $workflow = Workflow::updateOrCreate(
            ['name' => 'Blanket Order Approval', 'module' => 'purchasing'],
            [
                'entity_type' => BlanketOrder::class,
                'description' => 'Approval workflow for Blanket Orders',
                'is_active' => true,
                'created_by' => $user->id,
                'version' => 1,
            ]
        );

        // 3. Create Step assigned to Super Admin
        WorkflowStep::updateOrCreate(
            ['workflow_id' => $workflow->id, 'step_number' => 1],
            [
                'name' => 'Manager Approval',
                'step_type' => 'approval',
                'config' => [
                    'approval_type' => 'any_one',
                    'approvers' => [
                        'type' => 'role',
                        'role_ids' => [$role->id],
                    ],
                ],
                'sla_hours' => 24,
            ]
        );

        $this->command->info("✓ Blanket Order Workflow configured for role: $roleName");

        // 4. Create a Pending BPO and Start Workflow
        $vendor = Contact::where('type', 'vendor')->first();
        if ($vendor) {
            $bpo = BlanketOrder::factory()->create([
                'vendor_id' => $vendor->id,
                'status' => BlanketOrder::STATUS_PENDING_APPROVAL,
                'number' => 'BPO-TEST-WORKFLOW-'.rand(100, 999),
                'amount_limit' => 50000000,
            ]);

            // Start Workflow manually
            $engine = app(WorkflowEngine::class);
            $engine->startWorkflow($workflow, $bpo, $user->id);

            $this->command->info("✓ Created Sample BPO {$bpo->number} in Pending Approval state with active workflow task.");
        }
    }
}
