<?php

use App\Domain\Finance\Services\BudgetCheckService;
use App\Models\Budget;
use App\Models\BudgetEncumbrance;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->service = app(BudgetCheckService::class);

    // Create a department
    $this->department = Department::create([
        'name' => 'IT Department',
        'code' => 'IT',
        'is_active' => true,
    ]);
});

it('returns ok when budget is available', function () {
    $budget = Budget::create([
        'name' => 'IT Budget 2025',
        'department_id' => $this->department->id,
        'fiscal_year' => 2025,
        'period_type' => 'annual',
        'period_number' => 1,
        'amount' => 100000,
        'warning_threshold' => 80,
        'is_strict' => false,
        'is_active' => true,
    ]);

    $result = $this->service->check($this->department->id, 50000);

    expect($result->status)->toBe('ok');
    expect($result->isBlocked())->toBeFalse();
});

it('returns warning when utilization exceeds threshold', function () {
    $budget = Budget::create([
        'name' => 'IT Budget 2025',
        'department_id' => $this->department->id,
        'fiscal_year' => 2025,
        'period_type' => 'annual',
        'period_number' => 1,
        'amount' => 100000,
        'warning_threshold' => 80,
        'is_strict' => false,
        'is_active' => true,
    ]);

    // Create existing encumbrance that puts us at 50%
    BudgetEncumbrance::create([
        'budget_id' => $budget->id,
        'encumberable_type' => PurchaseRequest::class,
        'encumberable_id' => 1,
        'amount' => 50000,
        'status' => 'active',
    ]);

    // Requesting 35000 more would put us at 85% > 80% threshold
    $result = $this->service->check($this->department->id, 35000);

    expect($result->status)->toBe('warning');
    expect($result->isWarning())->toBeTrue();
});

it('returns blocked when budget exceeded in strict mode', function () {
    $budget = Budget::create([
        'name' => 'IT Budget 2025',
        'department_id' => $this->department->id,
        'fiscal_year' => 2025,
        'period_type' => 'annual',
        'period_number' => 1,
        'amount' => 100000,
        'warning_threshold' => 80,
        'is_strict' => true, // Strict mode
        'is_active' => true,
    ]);

    // Create existing encumbrance
    BudgetEncumbrance::create([
        'budget_id' => $budget->id,
        'encumberable_type' => PurchaseRequest::class,
        'encumberable_id' => 1,
        'amount' => 80000,
        'status' => 'active',
    ]);

    // Requesting 30000 more would exceed budget (110000 > 100000)
    $result = $this->service->check($this->department->id, 30000);

    expect($result->status)->toBe('blocked');
    expect($result->isBlocked())->toBeTrue();
});

it('returns warning when budget exceeded in non-strict mode', function () {
    $budget = Budget::create([
        'name' => 'IT Budget 2025',
        'department_id' => $this->department->id,
        'fiscal_year' => 2025,
        'period_type' => 'annual',
        'period_number' => 1,
        'amount' => 100000,
        'warning_threshold' => 80,
        'is_strict' => false, // Not strict
        'is_active' => true,
    ]);

    // Create existing encumbrance
    BudgetEncumbrance::create([
        'budget_id' => $budget->id,
        'encumberable_type' => PurchaseRequest::class,
        'encumberable_id' => 1,
        'amount' => 80000,
        'status' => 'active',
    ]);

    // Requesting 30000 more would exceed budget but not blocked
    $result = $this->service->check($this->department->id, 30000);

    expect($result->status)->toBe('warning');
    expect($result->isBlocked())->toBeFalse();
});

it('can create encumbrance', function () {
    $budget = Budget::create([
        'name' => 'IT Budget 2025',
        'department_id' => $this->department->id,
        'fiscal_year' => 2025,
        'period_type' => 'annual',
        'period_number' => 1,
        'amount' => 100000,
        'warning_threshold' => 80,
        'is_strict' => false,
        'is_active' => true,
    ]);

    // Create a real PR model
    $pr = PurchaseRequest::create([
        'document_number' => 'PR-TEST-001',
        'requester_id' => $this->user->id,
        'date' => now(),
        'status' => 'draft',
    ]);

    $encumbrance = $this->service->createEncumbrance($budget, $pr, 25000);

    expect($encumbrance)->toBeInstanceOf(BudgetEncumbrance::class);
    expect($encumbrance->amount)->toBe('25000.00');
    expect($encumbrance->status)->toBe('active');
    expect($budget->fresh()->encumbered_amount)->toBe(25000.0);
});
