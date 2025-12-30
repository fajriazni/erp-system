<?php

namespace Tests\Feature\Finance\Transfer;

use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_view_transfer_history_page()
    {
        $response = $this->get(route('finance.transfer.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_transfer()
    {
        $coa = ChartOfAccount::factory()->create(['type' => 'asset']);
        
        $from = BankAccount::create([
            'name' => 'Source Bank',
            'bank_name' => 'Bank A',
            'account_number' => 'ACC-A',
            'currency' => 'IDR',
            'opening_balance' => 1000,
            'current_balance' => 1000,
            'chart_of_account_id' => $coa->id,
            'type' => 'bank',
        ]);

        $to = BankAccount::create([
            'name' => 'Dest Cash',
            'bank_name' => 'Cash B',
            'account_number' => 'ACC-B',
            'currency' => 'IDR',
            'opening_balance' => 0,
            'current_balance' => 0,
            'chart_of_account_id' => $coa->id,
            'type' => 'cash',
        ]);

        $response = $this->post(route('finance.transfer.store'), [
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 500,
            'description' => 'Top up petty cash',
            'date' => now()->toDateString(),
        ]);

        $response->assertRedirect(route('finance.transfer.index'));

        // Verify Balances
        $this->assertEquals(500, $from->fresh()->current_balance);
        $this->assertEquals(500, $to->fresh()->current_balance);

        // Verify Transactions linked
        $this->assertDatabaseHas('bank_transactions', [
            'bank_account_id' => $from->id,
            'type' => 'transfer_out',
            'amount' => 500,
        ]);

        $this->assertDatabaseHas('bank_transactions', [
            'bank_account_id' => $to->id,
            'type' => 'transfer_in',
            'amount' => 500,
        ]);
    }

    public function test_cannot_transfer_insufficient_funds()
    {
        $coa = ChartOfAccount::factory()->create(['type' => 'asset']);
        
        $from = BankAccount::create([
            'name' => 'Source Bank',
            'bank_name' => 'Bank A',
            'account_number' => 'ACC-A',
            'currency' => 'IDR',
            'opening_balance' => 100,
            'current_balance' => 100,
            'chart_of_account_id' => $coa->id,
            'type' => 'bank',
        ]);

        $to = BankAccount::create([
            'name' => 'Dest',
            'bank_name' => 'Bank B',
            'account_number' => 'ACC-B',
            'currency' => 'IDR',
            'opening_balance' => 0,
            'current_balance' => 0,
            'chart_of_account_id' => $coa->id,
            'type' => 'bank',
        ]);

        $response = $this->post(route('finance.transfer.store'), [
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 500, // Exceeds balance
            'description' => 'Fail',
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertEquals(100, $from->fresh()->current_balance);
    }
}
