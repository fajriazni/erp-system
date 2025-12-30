<?php

use App\Models\BankAccount;
use App\Models\BankReconciliation;
use App\Models\BankTransaction;
use App\Models\ChartOfAccount;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->coa = ChartOfAccount::factory()->create(['type' => 'asset', 'code' => '1000-01']);
    $this->account = BankAccount::factory()->create(['chart_of_account_id' => $this->coa->id]);
});

it('can view reconciliation index', function () {
    $this->get(route('finance.reconciliation.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Finance/Reconciliation/Index')
            ->has('reconciliations.data')
        );
});

it('can create a reconciliation draft', function () {
    $this->post(route('finance.reconciliation.store'), [
        'bank_account_id' => $this->account->id,
        'statement_date' => now()->toDateString(),
        'start_date' => now()->startOfMonth()->toDateString(),
        'end_date' => now()->endOfMonth()->toDateString(),
        'statement_balance' => 5000,
    ])->assertRedirect();

    $this->assertDatabaseHas('bank_reconciliations', [
        'bank_account_id' => $this->account->id,
        'statement_balance' => 5000,
        'status' => 'draft',
    ]);
});

it('can toggle transaction reconciled status', function () {
    $transaction = BankTransaction::create([
        'bank_account_id' => $this->account->id,
        'type' => 'deposit',
        'amount' => 1000,
        'description' => 'Test Deposit',
        'transaction_date' => now()->toDateString(),
    ]);

    $reconciliation = BankReconciliation::create([
        'bank_account_id' => $this->account->id,
        'statement_date' => now()->toDateString(),
        'start_date' => now()->startOfMonth()->toDateString(),
        'end_date' => now()->endOfMonth()->toDateString(),
        'statement_balance' => 5000,
    ]);

    // Reconcile it
    $this->put(route('finance.reconciliation.update', $reconciliation), [
        'transaction_id' => $transaction->id,
    ])->assertSessionHas('success');

    expect($transaction->fresh()->bank_reconciliation_id)->toBe($reconciliation->id);
    expect($reconciliation->fresh()->reconciled_balance)->toBe('1000.00');

    // Unreconcile it
    $this->put(route('finance.reconciliation.update', $reconciliation), [
        'transaction_id' => $transaction->id,
    ])->assertSessionHas('success');

    expect($transaction->fresh()->bank_reconciliation_id)->toBeNull();
    expect($reconciliation->fresh()->reconciled_balance)->toBe('0.00');
});

it('can finalize reconciliation', function () {
    $transaction = BankTransaction::create([
        'bank_account_id' => $this->account->id,
        'type' => 'deposit',
        'amount' => 1000,
        'description' => 'Test Deposit',
        'transaction_date' => now()->toDateString(),
    ]);

    $reconciliation = BankReconciliation::create([
        'bank_account_id' => $this->account->id,
        'statement_date' => now()->toDateString(),
        'start_date' => now()->startOfMonth()->toDateString(),
        'end_date' => now()->endOfMonth()->toDateString(),
        'statement_balance' => 5000,
    ]);
    
    // Link transaction
    $transaction->update(['bank_reconciliation_id' => $reconciliation->id]);
    $reconciliation->update(['reconciled_balance' => 1000]);

    $this->post(route('finance.reconciliation.finalize', $reconciliation))
        ->assertRedirect(route('finance.reconciliation.index'));

    expect($reconciliation->fresh()->status)->toBe('reconciled');
    expect($transaction->fresh()->is_reconciled)->toBeTrue();
    expect($transaction->fresh()->reconciled_at)->not->toBeNull();
});
