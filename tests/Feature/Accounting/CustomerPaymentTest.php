<?php

use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\CustomerPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->customer = Contact::factory()->create(['type' => 'customer']);

    // Create Chart of Accounts for Posting Logic
    \App\Models\ChartOfAccount::firstOrCreate(['code' => '1000'], ['name' => 'Bank', 'type' => 'asset']);
    \App\Models\ChartOfAccount::firstOrCreate(['code' => '1100'], ['name' => 'Accounts Receivable', 'type' => 'asset']);

    // Create a POSTED Invoice to pay
    $this->invoice = CustomerInvoice::factory()->create([
        'customer_id' => $this->customer->id,
        'status' => 'posted', // Must be posted to be paid (conceptually)
        'total_amount' => 100,
        'subtotal' => 100, // Important for logic?
    ]);
});

test('can list customer payments', function () {
    CustomerPayment::create([
        'customer_id' => $this->customer->id,
        'payment_number' => 'PAY-001',
        'date' => now(),
        'amount' => 100,
        'status' => 'draft',
    ]);

    $this->actingAs($this->user)
        ->get(route('accounting.ar.payments.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Accounting/Ar/Payments/Index')
            ->has('payments.data', 1)
        );
});

test('can create customer payment', function () {
    $response = $this->actingAs($this->user)
        ->post(route('accounting.ar.payments.store'), [
            'customer_id' => $this->customer->id,
            'date' => now()->format('Y-m-d'),
            'amount' => 100,
            'payment_method' => 'bank_transfer',
            'lines' => [
                [
                    'invoice_id' => $this->invoice->id,
                    'amount' => 100,
                ],
            ],
        ]);

    $response->assertSessionHasNoErrors();
    $payment = CustomerPayment::latest()->first();
    expect($payment)->not->toBeNull();
    $response->assertRedirect(route('accounting.ar.payments.show', $payment));

    $this->assertDatabaseHas('customer_payments', [
        'customer_id' => $this->customer->id,
        'amount' => 100,
        'status' => 'draft',
    ]);

    $this->assertDatabaseHas('customer_payment_lines', [
        'customer_payment_id' => $payment->id,
        'customer_invoice_id' => $this->invoice->id,
        'amount' => 100,
    ]);
});

test('can post customer payment', function () {
    $payment = CustomerPayment::create([
        'customer_id' => $this->customer->id,
        'payment_number' => 'PAY-TEST-POST',
        'date' => now(),
        'amount' => 100,
        'status' => 'draft',
    ]);

    $payment->lines()->create([
        'customer_invoice_id' => $this->invoice->id,
        'amount' => 100, // Full payment
    ]);

    $this->actingAs($this->user)
        ->post(route('accounting.ar.payments.post', $payment))
        ->assertRedirect(route('accounting.ar.payments.show', $payment));

    $payment->refresh();
    expect($payment->status)->toBe('posted');
    expect($payment->journal_entry_id)->not->toBeNull();

    // Verify Invoice Status Update
    $this->invoice->refresh();
    expect($this->invoice->status)->toBe('paid');

    // Verify Journal Entry
    $this->assertDatabaseHas('journal_entries', [
        'id' => $payment->journal_entry_id,
        'status' => 'posted',
    ]);

    // Verify GL Lines (Bank Debit, AR Credit)
    $this->assertDatabaseHas('journal_entry_lines', [
        'journal_entry_id' => $payment->journal_entry_id,
        'credit' => 100, // AR Credit
    ]);
    $this->assertDatabaseHas('journal_entry_lines', [
        'journal_entry_id' => $payment->journal_entry_id,
        'debit' => 100, // Bank Debit
    ]);
});
