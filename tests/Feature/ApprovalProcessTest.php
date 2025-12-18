<?php

namespace Tests\Feature;

use App\Models\ApprovalRule;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalProcessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed necessary roles/permissions if needed, or just users
    }

    public function test_pr_auto_approves_if_no_rules_match()
    {
        $user = User::factory()->create();
        $uom = \App\Models\Uom::factory()->create();
        $product = \App\Models\Product::factory()->create(['uom_id' => $uom->id]);

        $data = [
            'department_id' => null,
            'date' => now(),
            'notes' => 'Test PR',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'estimated_unit_price' => 1000,
                ],
            ],
        ];

        // Ensure no rules exist
        ApprovalRule::query()->delete();

        $service = app(\App\Domain\Purchasing\Services\CreatePurchaseRequestService::class);
        $pr = $service->execute($data, $user->id);

        $this->assertEquals('approved', $pr->status);
    }

    public function test_pr_triggers_approval_if_rule_matches()
    {
        $user = User::factory()->create();
        $approver = User::factory()->create();

        // Create rule: PR > 5000 requires approval from $approver
        ApprovalRule::create([
            'name' => 'High Value PR',
            'entity_type' => 'purchase_request',
            'min_amount' => 5000,
            'max_amount' => null,
            'user_id' => $approver->id,
            'level' => 1,
        ]);

        $uom = \App\Models\Uom::factory()->create();
        $product = \App\Models\Product::factory()->create(['uom_id' => $uom->id]);

        $data = [
            'department_id' => null,
            'date' => now(),
            'notes' => 'Big PR',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'estimated_unit_price' => 1000, // Total 10000 > 5000
                ],
            ],
        ];

        $service = app(\App\Domain\Purchasing\Services\CreatePurchaseRequestService::class);
        $pr = $service->execute($data, $user->id);

        $this->assertEquals('pending_approval', $pr->status);
        $this->assertDatabaseHas('approval_requests', [
            'approvable_type' => PurchaseRequest::class,
            'approvable_id' => $pr->id,
            'approver_id' => $approver->id,
            'status' => 'pending',
        ]);
    }
}
