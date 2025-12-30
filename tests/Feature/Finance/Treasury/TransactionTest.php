<?php

use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->coa = ChartOfAccount::factory()->create(['type' => 'asset', 'code' => '1000-01']);
    $this->account = BankAccount::factory()->create([
        'chart_of_account_id' => $this->coa->id,
        'current_balance' => 1000,
    ]);
});

it('can deposit funds', function () {
    $this->post(route('finance.treasury.transaction', $this->account), [
        'type' => 'deposit',
        'amount' => 500,
        'description' => 'Sales Deposit',
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHas('success');

    expect($this->account->fresh()->current_balance)->toEqual('1500.00');
    $this->assertDatabaseHas('bank_transactions', [
        'bank_account_id' => $this->account->id,
        'type' => 'deposit',
        'amount' => 500,
    ]);
});

it('can withdraw funds', function () {
    $this->post(route('finance.treasury.transaction', $this->account), [
        'type' => 'withdrawal',
        'amount' => 200,
        'description' => 'Office Supplies',
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHas('success');

    expect($this->account->fresh()->current_balance)->toEqual('800.00');
    $this->assertDatabaseHas('bank_transactions', [
        'bank_account_id' => $this->account->id,
        'type' => 'withdrawal',
        'amount' => 200,
    ]);
});

it('can transfer funds between accounts', function () {
    $toAccount = BankAccount::factory()->create([
        'chart_of_account_id' => $this->coa->id,
        'current_balance' => 0,
    ]);

    $this->post(route('finance.treasury.transfer'), [
        'from_account_id' => $this->account->id,
        'to_account_id' => $toAccount->id,
        'amount' => 300,
        'description' => 'Internal Transfer',
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHas('success');

    expect($this->account->fresh()->current_balance)->toEqual('700.00');
    expect($toAccount->fresh()->current_balance)->toEqual('300.00');
});
