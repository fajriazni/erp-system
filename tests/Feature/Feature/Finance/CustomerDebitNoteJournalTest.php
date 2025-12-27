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

it('creates correct journal entry for customer debit note', function () {
    $customer = Contact::factory()->create(['type' => 'customer']);

    $note = CreditDebitNote::create([
        'type' => 'debit',
        'entity_type' => 'customer',
        'reference_number' => 'CDN-'.now()->format('Ym').'-0001',
        'date' => now(),
        'contact_id' => $customer->id,
        'amount' => 1000.00,
        'reason' => 'Under-invoicing adjustment',
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

    // Find AR account (1120)
    $arAccount = ChartOfAccount::where('code', '1120')->first();
    expect($arAccount)->not->toBeNull();

    // Find Revenue account (4100)
    $revenueAccount = ChartOfAccount::where('code', '4100')->first();
    expect($revenueAccount)->not->toBeNull();

    // Assert Debit to AR (increases asset)
    $arLine = $lines->firstWhere('chart_of_account_id', $arAccount->id);
    expect($arLine)->not->toBeNull();
    expect((float) $arLine->debit)->toBe(1000.00);
    expect((float) $arLine->credit)->toBe(0.00);

    // Assert Credit to Revenue (increases revenue)
    $revenueLine = $lines->firstWhere('chart_of_account_id', $revenueAccount->id);
    expect($revenueLine)->not->toBeNull();
    expect((float) $revenueLine->debit)->toBe(0.00);
    expect((float) $revenueLine->credit)->toBe(1000.00);
});

it('generates correct reference number for customer debit note', function () {
    $refNum = CreditDebitNote::generateReferenceNumber('debit', 'customer');

    expect($refNum)->toStartWith('CDN-');
    expect($refNum)->toContain(now()->format('Ym'));
});
