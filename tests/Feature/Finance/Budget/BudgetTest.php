<?php

namespace Tests\Feature\Finance\Budget;

use App\Models\Budget;
use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Domain\Finance\Services\BudgetCheckService;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_view_budget_index()
    {
        $response = $this->get(route('finance.budgets.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Finance/budgets/index')
            ->has('budgets.data')
        );
    }

    public function test_can_create_budget()
    {
        $department = Department::create(['code' => 'IT', 'name' => 'IT Dept']);

        $response = $this->post(route('finance.budgets.store'), [
            'name' => 'IT Budget 2025',
            'department_id' => $department->id,
            'fiscal_year' => 2025,
            'amount' => 100000000,
            'period_type' => 'annual',
            'period_number' => 1,
            'is_active' => true,
            'is_strict' => true,
            'warning_threshold' => 80,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('budgets', [
            'name' => 'IT Budget 2025',
            'amount' => 100000000,
        ]);
    }

    public function test_budget_check_service_logic()
    {
        $department = Department::create(['code' => 'HR', 'name' => 'HR Dept']);
        
        // Create 10M Budget
        $budget = Budget::create([
            'name' => 'HR Budget',
            'department_id' => $department->id,
            'fiscal_year' => date('Y'),
            'amount' => 10000000,
            'period_type' => 'annual',
            'period_number' => 1,
            'is_active' => true,
            'is_strict' => true,
            'warning_threshold' => 80,
        ]);

        $service = new BudgetCheckService();

        // 1. Check OK amount (1M)
        $result = $service->check($department->id, 1000000);
        $this->assertTrue($result->isOk());

        // 2. Create Encumbrance (9M total used)
        $service->createEncumbrance($budget, $budget, 8000000); // Hack: using budget itself as dummy model
        $budget->refresh();

        // 3. Check Warning amount (1.5M -> 9.5M total = 95%)
        $result = $service->check($department->id, 1500000);
        // It fits in budget (10M), but > 80% used. But wait, logic is:
        // Used: 8M. Requested: 1.5M. Total: 9.5M / 10M = 95%
        // Utilization after > warning threshold (80)
        $this->assertTrue($result->isWarning());

        // 4. Check Blocked amount (3M -> 11M total)
        $result = $service->check($department->id, 3000000);
        $this->assertTrue($result->isBlocked());
    }
}
