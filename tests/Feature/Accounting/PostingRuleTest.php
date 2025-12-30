<?php

namespace Tests\Feature\Accounting;

use App\Models\ChartOfAccount;
use App\Models\PostingRule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostingRuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_posting_rules_index()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get(route('accounting.posting-rules.index'));

        $response->assertStatus(200);
    }

    public function test_can_create_posting_rule()
    {
        $user = User::factory()->create();
        $account = ChartOfAccount::create(['code' => 'TEST-100', 'name' => 'Cash', 'type' => 'asset']);
        $account2 = ChartOfAccount::create(['code' => 'TEST-200', 'name' => 'Sales', 'type' => 'revenue']);

        $payload = [
            'event_type' => 'test.event',
            'description' => 'Test Rule',
            'module' => 'Sales',
            'lines' => [
                [
                    'chart_of_account_id' => $account->id,
                    'debit_credit' => 'debit',
                    'amount_key' => 'total',
                    'description_template' => 'Test',
                ],
                [
                    'chart_of_account_id' => $account2->id,
                    'debit_credit' => 'credit',
                    'amount_key' => 'total',
                    'description_template' => 'Test',
                ]
            ]
        ];

        $response = $this->actingAs($user)->post(route('accounting.posting-rules.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('posting_rules', ['event_type' => 'test.event']);
        $this->assertDatabaseCount('posting_rule_lines', 2);
    }

    public function test_validates_posting_rule_lines_count()
    {
        $user = User::factory()->create();
        
        $payload = [
            'event_type' => 'test.event.fail',
            'description' => 'Test Rule',
            'module' => 'Sales',
            'lines' => [] // Empty lines
        ];

        $response = $this->actingAs($user)->post(route('accounting.posting-rules.store'), $payload);

        $response->assertSessionHasErrors('lines');
    }
}
