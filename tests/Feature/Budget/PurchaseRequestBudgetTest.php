<?php

namespace Tests\Feature\Budget;

use App\Domain\Finance\Services\BudgetCheckService;
use App\Models\Budget;
use App\Models\Department;
use App\Models\Product;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseRequestBudgetTest extends TestCase
{
    use RefreshDatabase;

    protected Department $department;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup initial data
        $this->user = User::factory()->create();
        $this->department = Department::factory()->create(['name' => 'IT Dept']);
        $uom = \App\Models\Uom::factory()->create(['name' => 'Unit', 'symbol' => 'unit']);
        $this->product = Product::factory()->create([
            'cost' => 1000,
            'uom_id' => $uom->id
        ]); // $1000 per unit
    }

    public function test_pr_creation_fails_if_over_budget_strict()
    {
        // 1. Create Strict Budget ($500)
        $budget = Budget::create([
            'department_id' => $this->department->id,
            'name' => 'IT Budget 2025',
            'fiscal_year' => date('Y'),
            'amount' => 500, // Only 500 available
            'is_active' => true,
            'is_strict' => true, // Strict mode
            'warning_threshold' => 80,
        ]);

        // 2. Mock Requester
        $this->actingAs($this->user);

        // 3. Attempt to create PR for $1000 (Over budget)
        $data = [
            'department_id' => $this->department->id,
            'date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'estimated_unit_price' => 1000,
                ]
            ]
        ];

        // 4. Assert Validation Exception
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        
        $service = app(\App\Domain\Purchasing\Services\CreatePurchaseRequestService::class);
        $service->execute($data, $this->user->id);
    }

    public function test_pr_creation_succeeds_with_encumbrance_if_budget_sufficient()
    {
        // 1. Create Budget ($2000)
        $budget = Budget::create([
            'department_id' => $this->department->id,
            'name' => 'IT Budget 2025',
            'fiscal_year' => date('Y'),
            'amount' => 2000,
            'is_active' => true,
            'is_strict' => true,
        ]);

        // 2. Attempt to create PR for $1000
        $data = [
            'department_id' => $this->department->id,
            'date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'estimated_unit_price' => 1000,
                ]
            ]
        ];

        $service = app(\App\Domain\Purchasing\Services\CreatePurchaseRequestService::class);
        $pr = $service->execute($data, $this->user->id);

        // 3. Assertions
        $this->assertDatabaseHas('purchase_requests', ['id' => $pr->id]);
        
        // Check Encumbrance created
        $this->assertDatabaseHas('budget_encumbrances', [
            'budget_id' => $budget->id,
            'encumberable_id' => $pr->id,
            'encumberable_type' => PurchaseRequest::class,
            'amount' => 1000,
            'status' => 'active'
        ]);
    }
}
