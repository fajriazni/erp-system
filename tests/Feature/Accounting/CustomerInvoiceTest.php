<?php

use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->customer = Contact::factory()->create(['type' => 'customer']);
    $this->product = Product::factory()->create(['price' => 100]);
});

test('can list customer invoices', function () {
    CustomerInvoice::factory()->count(3)->create(['customer_id' => $this->customer->id]);

    $this->actingAs($this->user)
        ->get(route('accounting.ar.invoices.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Accounting/Ar/Invoices')
            ->has('invoices.data', 3)
        );
});

test('can create customer invoice', function () {
    $response = $this->actingAs($this->user)
        ->post(route('accounting.ar.invoices.store'), [
            'customer_id' => $this->customer->id,
            'date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'description' => 'Test Item',
                    'quantity' => 2,
                    'unit_price' => 100,
                ],
            ],
        ]);

    $response->assertSessionHasNoErrors();

    $invoice = CustomerInvoice::latest()->first();
    expect($invoice)->not->toBeNull();

    $response->assertRedirect(route('accounting.ar.invoices.show', $invoice));

    $this->assertDatabaseHas('customer_invoices', [
        'customer_id' => $this->customer->id,
        'status' => 'draft',
        'subtotal' => 200,
        'total_amount' => 222,
        'tax_amount' => 22,
    ]);

    $this->assertDatabaseHas('customer_invoice_lines', [
        'product_id' => $this->product->id,
        'quantity' => 2,
        'subtotal' => 200,
    ]);
});

test('can post customer invoice', function () {
    // Seed necessary Chart of Accounts
    \App\Models\ChartOfAccount::firstOrCreate(['code' => '1100'], ['name' => 'Accounts Receivable', 'type' => 'asset']);
    \App\Models\ChartOfAccount::firstOrCreate(['code' => '4000'], ['name' => 'Sales', 'type' => 'revenue']);
    \App\Models\ChartOfAccount::firstOrCreate(['code' => '2300'], ['name' => 'Output Tax', 'type' => 'liability']);

    $invoice = CustomerInvoice::factory()->create([
        'customer_id' => $this->customer->id,
        'status' => 'draft',
        'subtotal' => 100,
        'tax_amount' => 10,
        'total_amount' => 110,
        'date' => now(),
    ]);

    // No, we call the route. The route calls post method which uses service.

    $this->actingAs($this->user)
        ->post(route('accounting.ar.invoices.post', $invoice))
        ->assertRedirect(route('accounting.ar.invoices.show', $invoice));

    $invoice->refresh();
    expect($invoice->status)->toBe('posted');
    expect($invoice->posted_at)->not->toBeNull();
    expect($invoice->journal_entry_id)->not->toBeNull();

    // Check Journal Entry
    $this->assertDatabaseHas('journal_entries', [
        'id' => $invoice->journal_entry_id,
        'status' => 'posted',
        'reference_number' => $invoice->invoice_number,
    ]);

    // Check Journal Entry Lines
    $this->assertDatabaseHas('journal_entry_lines', [
        'journal_entry_id' => $invoice->journal_entry_id,
        'debit' => 110,
        'credit' => 0,
        // AR Account
    ]);

    $this->assertDatabaseHas('journal_entry_lines', [
        'journal_entry_id' => $invoice->journal_entry_id,
        'debit' => 0,
        'credit' => 100,
        // Sales Account
    ]);
});
