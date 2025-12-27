<?php

namespace Tests\Feature\Accounting;

use App\Models\ChartOfAccount;
use App\Models\JournalTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_list_templates()
    {
        JournalTemplate::factory()->create(['name' => 'Template 1']);
        JournalTemplate::factory()->create(['name' => 'Template 2']);

        $response = $this->get(route('accounting.templates.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Accounting/Templates/Index')
                ->has('templates.data', 2)
            );
    }

    public function test_can_create_template()
    {
        $debitAccount = ChartOfAccount::factory()->create(['type' => 'expense']);
        $creditAccount = ChartOfAccount::factory()->create(['type' => 'asset']);

        $response = $this->post(route('accounting.templates.store'), [
            'name' => 'New Template',
            'description' => 'Test Description',
            'is_active' => true,
            'lines' => [
                [
                    'chart_of_account_id' => $debitAccount->id,
                    'debit_credit' => 'debit',
                    'amount_formula' => 'total',
                    'description' => 'Debit Line',
                ],
                [
                    'chart_of_account_id' => $creditAccount->id,
                    'debit_credit' => 'credit',
                    'amount_formula' => 'total',
                    'description' => 'Credit Line',
                ],
            ],
        ]);

        $response->assertRedirect(route('accounting.templates.index'));
        $this->assertDatabaseHas('journal_templates', ['name' => 'New Template']);
        $this->assertDatabaseCount('journal_template_lines', 2);
    }

    public function test_cannot_create_unbalanced_template_structure()
    {
        // Missing credit line
        $account = ChartOfAccount::factory()->create();

        $response = $this->post(route('accounting.templates.store'), [
            'name' => 'Invalid Template',
            'lines' => [
                [
                    'chart_of_account_id' => $account->id,
                    'debit_credit' => 'debit',
                    'amount_formula' => 'total',
                ],
            ],
        ]);

        $response->assertSessionHasErrors('lines');
    }

    public function test_can_update_template()
    {
        $template = JournalTemplate::factory()->create();
        $line1 = $template->lines()->create([
            'chart_of_account_id' => ChartOfAccount::factory()->create()->id,
            'debit_credit' => 'debit',
            'sequence' => 1,
        ]);
        $line2 = $template->lines()->create([
            'chart_of_account_id' => ChartOfAccount::factory()->create()->id,
            'debit_credit' => 'credit',
            'sequence' => 2,
        ]);

        $newAccount = ChartOfAccount::factory()->create();

        $response = $this->put(route('accounting.templates.update', $template), [
            'name' => 'Updated Name',
            'is_active' => false,
            'lines' => [
                [
                    'chart_of_account_id' => $line1->chart_of_account_id,
                    'debit_credit' => 'debit',
                    'amount_formula' => 'total',
                ],
                [
                    'chart_of_account_id' => $newAccount->id,
                    'debit_credit' => 'credit',
                    'amount_formula' => 'total',
                ],
            ],
        ]);

        $response->assertRedirect(route('accounting.templates.index'));
        $template->refresh();
        $this->assertEquals('Updated Name', $template->name);
        $this->assertFalse($template->is_active);
        $this->assertEquals($newAccount->id, $template->lines->last()->chart_of_account_id);
    }

    public function test_can_delete_template()
    {
        $template = JournalTemplate::factory()->create();

        $response = $this->delete(route('accounting.templates.destroy', $template));

        $response->assertRedirect(route('accounting.templates.index'));
        $this->assertModelMissing($template);
    }
}
