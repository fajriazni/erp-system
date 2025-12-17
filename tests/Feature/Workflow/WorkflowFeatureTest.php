<?php

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Model::unguard();
    Notification::fake();

    // Clear permission cache
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

    $this->user = User::factory()->create();
    $this->role = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
    $this->user->assignRole($this->role);
});

it('can delegate an approval task', function () {
    // 1. Setup Workflow
    $workflow = Workflow::create([
        'name' => 'PO Workflow',
        'entity_type' => PurchaseOrder::class,
        'description' => 'Test',
        'is_active' => true,
        'module' => 'Purchasing',
        'created_by' => $this->user->id,
    ]);

    $step = WorkflowStep::create([
        'workflow_id' => $workflow->id,
        'step_number' => 1,
        'name' => 'Manager Approval',
        'step_type' => 'approval',
        'config' => [
            'approvers' => [
                'type' => 'user',
                'user_ids' => [$this->user->id],
            ],
        ],
    ]);

    // 2. Start Instance
    $po = PurchaseOrder::factory()->create();
    $engine = app(WorkflowEngine::class);
    $instance = $engine->startWorkflow($workflow, $po, $this->user->id);

    // 3. Delegate
    $task = $instance->approvalTasks()->first();
    $delegateUser = User::factory()->create();

    $this->actingAs($this->user)
        ->postJson("/api/approval-tasks/{$task->id}/delegate", [
            'delegate_to_user_id' => $delegateUser->id,
            'reason' => 'Busy',
        ])
        ->assertOk();

    // 4. Verify Delegation
    $task->refresh();
    expect($task->assigned_to_user_id)->toBe($delegateUser->id);
    expect($task->original_assigned_to_user_id)->toBe($this->user->id);
});

it('auto approves based on rules', function () {
    // 1. Setup Workflow with Rules
    $workflow = Workflow::create([
        'name' => 'Auto Approve Workflow',
        'entity_type' => PurchaseOrder::class,
        'description' => 'Test Auto',
        'is_active' => true,
        'module' => 'Purchasing',
        'created_by' => $this->user->id,
    ]);

    $step = WorkflowStep::create([
        'workflow_id' => $workflow->id,
        'step_number' => 1,
        'name' => 'Auto Step',
        'step_type' => 'approval',
        'config' => [
            'approvers' => ['type' => 'role', 'role_ids' => [$this->role->id]],
            'auto_approval_rules' => [
                ['field' => 'total_amount', 'operator' => '<', 'value' => 1000],
            ],
        ],
    ]);

    // 2. Start Instance with Entity matching rules
    $po = PurchaseOrder::factory()->create(['total_amount' => 500]);
    $engine = app(WorkflowEngine::class);
    $instance = $engine->startWorkflow($workflow, $po, $this->user->id);

    // 3. Verify Auto Approval (Step completed immediately)
    $instance->refresh();
    expect($instance->status)->toBe('approved');
});

it('does not auto approve if rules not met', function () {
    // 1. Setup Workflow with Rules
    $workflow = Workflow::create([
        'name' => 'Auto Approve Workflow 2',
        'entity_type' => PurchaseOrder::class,
        'description' => 'Test Auto Fail',
        'is_active' => true,
        'module' => 'Purchasing',
        'created_by' => $this->user->id,
    ]);

    $step = WorkflowStep::create([
        'workflow_id' => $workflow->id,
        'step_number' => 1,
        'name' => 'Auto Step',
        'step_type' => 'approval',
        'config' => [
            'approvers' => ['type' => 'user', 'user_ids' => [$this->user->id]],
            'auto_approval_rules' => [
                ['field' => 'total_amount', 'operator' => '<', 'value' => 1000],
            ],
        ],
    ]);

    // 2. Start Instance with Entity NOT matching rules
    $po = PurchaseOrder::factory()->create(['total_amount' => 1500]);
    $engine = app(WorkflowEngine::class);
    $instance = $engine->startWorkflow($workflow, $po, $this->user->id);

    // 3. Verify Task Created (Not Auto Approved)
    $instance->refresh();
    expect($instance->status)->toBe('pending');
    expect($instance->current_step_id)->toBe($step->id);
});

it('can bulk cancel workflows', function () {
    // 1. Create Workflows
    $workflow = Workflow::create([
        'name' => 'Bulk Cancel Workflow',
        'entity_type' => PurchaseOrder::class,
        'is_active' => true,
        'module' => 'Purchasing',
        'created_by' => $this->user->id,
    ]);
    WorkflowStep::create([
        'workflow_id' => $workflow->id,
        'step_number' => 1,
        'name' => 'Step 1',
        'config' => ['approvers' => ['type' => 'user', 'user_ids' => [$this->user->id]]],
    ]);

    $po1 = PurchaseOrder::factory()->create();
    $po2 = PurchaseOrder::factory()->create();

    $engine = app(WorkflowEngine::class);
    $instance1 = $engine->startWorkflow($workflow, $po1, $this->user->id);
    $instance2 = $engine->startWorkflow($workflow, $po2, $this->user->id);

    // 2. Call Bulk Cancel Endpoint
    // Use Super Admin role
    $adminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $this->user->assignRole($adminRole);

    // Force permission reload for user
    $this->user->load('roles');

    $this->actingAs($this->user)
        ->post('/workflows/instances/bulk', [
            'ids' => [$instance1->id, $instance2->id],
            'action' => 'cancel',
            'reason' => 'Bulk delete',
        ])
        ->assertRedirect(); // Should redirect back with success

    // 3. Verify Cancelled
    $instance1->refresh();
    $instance2->refresh();

    expect($instance1->status)->toBe('cancelled');
    expect($instance2->status)->toBe('cancelled');
});
