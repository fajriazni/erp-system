<?php

namespace Tests\Feature\Finance\PettyCash;

use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PettyCashTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_view_petty_cash_dashboard()
    {
        $response = $this->get(route('finance.petty-cash.index'));
        $response->assertStatus(200);
    }

    public function test_can_view_cash_accounts_only()
    {
        BankAccount::create([
            'name' => 'Main Bank',
            'bank_name' => 'BCA',
            'account_number' => '123',
            'currency' => 'IDR',
            'opening_balance' => 1000,
            'current_balance' => 1000,
            'chart_of_account_id' => ChartOfAccount::factory()->create()->id,
            'type' => BankAccount::TYPE_BANK,
        ]);

        $cash = BankAccount::create([
            'name' => 'Office Cash',
            'bank_name' => 'Cash Drawer',
            'account_number' => 'CASH-01',
            'currency' => 'IDR',
            'opening_balance' => 500,
            'current_balance' => 500,
            'chart_of_account_id' => ChartOfAccount::factory()->create()->id,
            'type' => BankAccount::TYPE_CASH,
        ]);

        $response = $this->get(route('finance.petty-cash.index'));
        
        $response->assertInertia(fn ($page) => $page
            ->component('Accounting/Bank/PettyCash')
            ->has('accounts', 1)
            ->where('accounts.0.id', $cash->id)
        );
    }

    public function test_can_create_cash_account()
    {
        $coa = ChartOfAccount::factory()->create(['type' => 'asset']);

        $response = $this->post(route('finance.treasury.store'), [
            'name' => 'Front Desk Cash',
            'bank_name' => 'Cash Drawer',
            'account_number' => 'PC-002',
            'currency' => 'IDR',
            'opening_balance' => 200,
            'current_balance' => 200,
            'chart_of_account_id' => $coa->id,
            'type' => 'cash', // Explicitly setting type
            'is_active' => true,
        ]);

        $response->assertRedirect(route('finance.treasury.index'));

        $this->assertDatabaseHas('bank_accounts', [
            'name' => 'Front Desk Cash',
            'type' => 'cash',
        ]);
    }
}
