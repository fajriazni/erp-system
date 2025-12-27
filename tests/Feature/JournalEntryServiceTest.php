<?php

/**
 * Journal Entry Service Unit Tests
 *
 * Tests core domain services for journal entries without browser dependency
 */

use App\Domain\Finance\Events\JournalEntryCreated;
use App\Domain\Finance\Events\JournalEntryPosted;
use App\Domain\Finance\Events\JournalEntryReversed;
use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Domain\Finance\Services\PostJournalEntryService;
use App\Domain\Finance\Services\ReverseJournalEntryService;
use App\Domain\Finance\ValueObjects\Money;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create test accounts directly
    $this->assetAccount = ChartOfAccount::create([
        'code' => '1000',
        'name' => 'Test Asset Account',
        'type' => 'asset',
        'is_active' => true,
    ]);

    $this->liabilityAccount = ChartOfAccount::create([
        'code' => '2000',
        'name' => 'Test Liability Account',
        'type' => 'liability',
        'is_active' => true,
    ]);

    $this->revenueAccount = ChartOfAccount::create([
        'code' => '4000',
        'name' => 'Test Revenue Account',
        'type' => 'revenue',
        'is_active' => true,
    ]);

    $this->user = User::factory()->create();
});

test('can create a balanced journal entry', function () {
    Event::fake();

    $service = app(CreateJournalEntryService::class);

    $entry = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null,
        description: 'Test entry',
        lines: [
            [
                'chart_of_account_id' => $this->assetAccount->id,
                'debit' => 10000,
                'credit' => 0,
            ],
            [
                'chart_of_account_id' => $this->liabilityAccount->id,
                'debit' => 0,
                'credit' => 10000,
            ],
        ],
        user: $this->user
    );

    expect($entry)->toBeInstanceOf(JournalEntry::class);
    expect($entry->status)->toBe('draft');
    expect($entry->isBalanced())->toBeTrue();
    expect($entry->getTotalDebit()->amount())->toBe(10000.0);
    expect($entry->getTotalCredit()->amount())->toBe(10000.0);

    Event::assertDispatched(JournalEntryCreated::class);
});

test('throws exception for unbalanced journal entry', function () {
    $service = app(CreateJournalEntryService::class);

    $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: 'JE-UNBALANCED',
        description: 'Unbalanced',
        lines: [
            ['chart_of_account_id' => $this->assetAccount->id, 'debit' => 10000, 'credit' => 0],
            ['chart_of_account_id' => $this->liabilityAccount->id, 'debit' => 0, 'credit' => 5000],
        ],
        user: $this->user
    );
})->throws(InvalidArgumentException::class, 'Journal Entry must be balanced');

test('can post a draft journal entry', function () {
    Event::fake();

    $createService = app(CreateJournalEntryService::class);
    $entry = $createService->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null,
        description: 'Entry to post',
        lines: [
            ['chart_of_account_id' => $this->assetAccount->id, 'debit' => 50000, 'credit' => 0],
            ['chart_of_account_id' => $this->liabilityAccount->id, 'debit' => 0, 'credit' => 50000],
        ],
        user: $this->user
    );

    expect($entry->status)->toBe('draft');

    $postService = app(PostJournalEntryService::class);
    $postedEntry = $postService->execute($entry, $this->user);

    expect($postedEntry->status)->toBe('posted');
    expect($postedEntry->isPosted())->toBeTrue();
    expect($postedEntry->canBeEdited())->toBeFalse();

    Event::assertDispatched(JournalEntryPosted::class);
});

test('cannot post unbalanced entry', function () {
    $entry = JournalEntry::factory()->create(['status' => 'draft']);

    // Create only one line - unbalanced
    $assetAccount = $this->assetAccount;
    $entry->lines()->create([
        'chart_of_account_id' => $assetAccount->id,
        'debit' => 10000,
        'credit' => 0,
    ]);

    expect($entry->isBalanced())->toBeFalse();

    $postService = app(PostJournalEntryService::class);
    $postService->execute($entry, $this->user);
})->throws(InvalidArgumentException::class);

test('can reverse a posted journal entry', function () {
    Event::fake();

    // Create and post entry
    $assetAccount = $this->assetAccount;
    $revenueAccount = $this->revenueAccount;

    $createService = app(CreateJournalEntryService::class);
    $entry = $createService->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: 'JE-TO-REVERSE',
        description: 'Entry to reverse',
        lines: [
            ['chart_of_account_id' => $assetAccount->id, 'debit' => 100000, 'credit' => 0],
            ['chart_of_account_id' => $revenueAccount->id, 'debit' => 0, 'credit' => 100000],
        ],
        user: $this->user
    );

    $postService = app(PostJournalEntryService::class);
    $postedEntry = $postService->execute($entry, $this->user);

    expect($postedEntry->hasBeenReversed())->toBeFalse();

    $reverseService = app(ReverseJournalEntryService::class);
    $reversalEntry = $reverseService->execute($postedEntry, $this->user, 'Test reversal');

    expect($reversalEntry->reference_number)->toContain('-REV');
    expect($reversalEntry->isPosted())->toBeTrue();
    expect($reversalEntry->reversed_entry_id)->toBe($postedEntry->id);
    expect($postedEntry->fresh()->hasBeenReversed())->toBeTrue();

    // Verify lines are swapped
    $originalFirstLine = $postedEntry->lines->first();
    $reversalFirstLine = $reversalEntry->lines->first();

    expect($reversalFirstLine->debit)->toBe($originalFirstLine->credit);
    expect($reversalFirstLine->credit)->toBe($originalFirstLine->debit);

    Event::assertDispatched(JournalEntryReversed::class);
});

test('cannot reverse a draft entry', function () {
    $entry = JournalEntry::factory()->create(['status' => 'draft']);

    $reverseService = app(ReverseJournalEntryService::class);
    $reverseService->execute($entry, $this->user, 'Test');
})->throws(InvalidArgumentException::class, 'Only posted entries can be reversed');

test('money value object works correctly', function () {
    $money = Money::from(1000, 'USD');

    expect($money->amount())->toBe(1000.0);
    expect($money->currency())->toBe('USD');
    expect($money->format())->toBe('USD 1,000.00');

    $doubled = $money->multiply(2);
    expect($doubled->amount())->toBe(2000.0);

    $sum = $money->add(Money::from(500, 'USD'));
    expect($sum->amount())->toBe(1500.0);
});

test('journal entry number auto-generation works', function () {
    $service = app(CreateJournalEntryService::class);
    $assetAccount = $this->assetAccount;
    $liabilityAccount = $this->liabilityAccount;

    $entry = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null, // Should auto-generate
        description: 'Auto ref number test',
        lines: [
            ['chart_of_account_id' => $assetAccount->id, 'debit' => 1000, 'credit' => 0],
            ['chart_of_account_id' => $liabilityAccount->id, 'debit' => 0, 'credit' => 1000],
        ],
        user: $this->user
    );

    expect($entry->reference_number)->toMatch('/^JE-\d{6}-\d{5}$/');
});
