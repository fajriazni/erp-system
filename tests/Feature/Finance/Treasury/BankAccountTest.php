<?php

use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->coa = ChartOfAccount::factory()->create(['type' => 'asset', 'code' => '1000-01']);
});

it('can view bank accounts index', function () {
    BankAccount::factory()->create(['chart_of_account_id' => $this->coa->id]);

    $this->get(route('finance.treasury.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Finance/Treasury/Index')
            ->has('accounts.data', 1)
        );
});

it('can create a new bank account', function () {
    $this->post(route('finance.treasury.store'), [
        'name' => 'Test Bank',
        'bank_name' => 'BCA',
        'account_number' => '1234567890',
        'currency' => 'IDR',
        'opening_balance' => 1000000,
        'current_balance' => 1000000,
        'chart_of_account_id' => $this->coa->id,
        'is_active' => true,
    ])->assertRedirect(route('finance.treasury.index'));

    $this->assertDatabaseHas('bank_accounts', [
        'name' => 'Test Bank',
        'current_balance' => 1000000,
    ]);
});

it('can view a bank account details', function () {
    $account = BankAccount::factory()->create(['chart_of_account_id' => $this->coa->id]);

    $this->get(route('finance.treasury.show', $account))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Finance/Treasury/Show')
            ->has('account')
        );
});
