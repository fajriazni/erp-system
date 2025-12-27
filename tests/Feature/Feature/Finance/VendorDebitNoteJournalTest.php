<?php

use App\Domain\Finance\Services\PostCreditDebitNoteService;
use App\Models\ChartOfAccount;
use App\Models\Contact;
use App\Models\CreditDebitNote;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    $this->seed(\Database\Seeders\AccountingSeeder::class);
});

it('creates correct journal entry for vendor debit note', function () {
    $vendor = Contact::factory()->create(['type' => 'vendor']);

    $note = CreditDebitNote::create([
        'type' => 'debit',
        'entity_type' => 'vendor',
        'reference_number' => 'VDN-'.now()->format('Ym').'-0001',
        'date' => now(),
        'contact_id' => $vendor->id,
        'amount' => 500.00,
        'reason' => 'Additional charges from vendor',
        'status' => 'draft',
    ]);

    $service = app(PostCreditDebitNoteService::class);
    $service->execute($note);

    $note->refresh();

    // Assert note is posted
    expect($note->status)->toBe('posted');
    expect($note->journal_entry_id)->not->toBeNull();

    // Assert journal entry created
    $journalEntry = JournalEntry::find($note->journal_entry_id);
    expect($journalEntry)->not->toBeNull();
    expect($journalEntry->reference_number)->toBe($note->reference_number);

    // Assert correct journal lines
    $lines = $journalEntry->lines;
    expect($lines)->toHaveCount(2);

    // Find Expense account (5100)
    $expenseAccount = ChartOfAccount::where('code', '5100')->first();
    expect($expenseAccount)->not->toBeNull();

    // Find AP account (2100)
    $apAccount = ChartOfAccount::where('code', '2100')->first();
    expect($apAccount)->not->toBeNull();

    // Assert Debit to Expense (increases expense)
    $expenseLine = $lines->firstWhere('chart_of_account_id', $expenseAccount->id);
    expect($expenseLine)->not->toBeNull();
    expect((float) $expenseLine->debit)->toBe(500.00);
    expect((float) $expenseLine->credit)->toBe(0.00);

    // Assert Credit to AP (increases liability)
    $apLine = $lines->firstWhere('chart_of_account_id', $apAccount->id);
    expect($apLine)->not->toBeNull();
    expect((float) $apLine->debit)->toBe(0.00);
    expect((float) $apLine->credit)->toBe(500.00);
});

it('generates correct reference number for vendor debit note', function () {
    $refNum = CreditDebitNote::generateReferenceNumber('debit', 'vendor');

    expect($refNum)->toStartWith('VDN-');
    expect($refNum)->toContain(now()->format('Ym'));
});
