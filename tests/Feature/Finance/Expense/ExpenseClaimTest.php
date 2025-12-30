<?php

namespace Tests\Feature\Finance\Expense;

use App\Models\Department;
use App\Models\User;
use App\Models\ExpenseClaim;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseClaimTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_view_expense_claims_page()
    {
        $response = $this->get(route('finance.expenses.reimbursements.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Finance/Expenses/Reimbursements/Index')
            ->has('claims.data')
        );
    }

    public function test_can_create_expense_claim_with_items()
    {
        $department = Department::create(['code' => 'IT', 'name' => 'IT Dept']);

        $response = $this->post(route('finance.expenses.reimbursements.store'), [
            'title' => 'Client Lunch',
            'department_id' => $department->id,
            'description' => 'Meeting with XYZ Corp',
            'items' => [
                [
                    'date' => '2025-01-01',
                    'category' => 'Meals',
                    'description' => 'Sushi Place',
                    'amount' => 500000,
                ],
                [
                    'date' => '2025-01-01',
                    'category' => 'Transport',
                    'description' => 'Grab to location',
                    'amount' => 50000,
                ]
            ]
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('expense_claims', [
            'title' => 'Client Lunch',
            'total_amount' => 550000,
            'status' => 'draft',
        ]);
        
        $this->assertDatabaseCount('expense_items', 2);
    }

    public function test_workflow_transitions()
    {
        $department = Department::create(['code' => 'HR', 'name' => 'HR Dept']);
        $user = User::factory()->create();
        $this->actingAs($user);

        // 1. Create Draft
        $claim = ExpenseClaim::create([
            'user_id' => $user->id,
            'department_id' => $department->id,
            'title' => 'Workflow Test',
            'total_amount' => 100000,
            'status' => 'draft',
        ]);
        $claim->items()->create([
            'date' => now(), 'category' => 'Other', 'description' => 'Test', 'amount' => 100000
        ]);

        // 2. Submit
        $response = $this->post(route('finance.expenses.reimbursements.submit', $claim));
        $response->assertRedirect();
        $this->assertEquals('submitted', $claim->refresh()->status);

        // 3. Approve (as another user/admin)
        $approver = User::factory()->create();
        $this->actingAs($approver);
        
        $response = $this->post(route('finance.expenses.reimbursements.approve', $claim));
        $response->assertRedirect();
        
        $claim->refresh();
        $this->assertEquals('approved', $claim->status);
        $this->assertEquals($approver->id, $claim->approver_id);
    }
}
