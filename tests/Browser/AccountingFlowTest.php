<?php

/**
 * Accounting Module Browser Tests
 *
 * Tests the complete accounting workflow:
 * - Chart of Accounts management
 * - Journal Entry creation
 * - Journal Entry posting
 * - Journal Entry reversal
 * - General Ledger reporting
 * - Trial Balance
 */

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Support\Facades\Event;

use function Pest\Laravel\actingAs;

/**
 * @property User $user
 * @property ChartOfAccount $assetAccount
 * @property ChartOfAccount $liabilityAccount
 * @property ChartOfAccount $revenueAccount
 * @property ChartOfAccount $expenseAccount
 */
beforeEach(function () {
    // Create authenticated user
    $this->user = User::factory()->create([
        'name' => 'Accounting User',
        'email' => 'accounting@test.com',
    ]);

    // Create sample accounts directly
    $this->assetAccount = ChartOfAccount::create([
        'code' => '1000',
        'name' => 'Cash and Bank',
        'type' => 'asset',
        'is_active' => true,
    ]);

    $this->liabilityAccount = ChartOfAccount::create([
        'code' => '2000',
        'name' => 'Accounts Payable',
        'type' => 'liability',
        'is_active' => true,
    ]);

    $this->revenueAccount = ChartOfAccount::create([
        'code' => '4000',
        'name' => 'Sales Revenue',
        'type' => 'revenue',
        'is_active' => true,
    ]);

    $this->expenseAccount = ChartOfAccount::create([
        'code' => '5000',
        'name' => 'Operating Expenses',
        'type' => 'expense',
        'is_active' => true,
    ]);

    actingAs($this->user);
});

/*
 * ============================================================================
 * CHART OF ACCOUNTS TESTS
 * ============================================================================
 */

it('displays chart of accounts index page', function () {
    $page = visit('/accounting/chart-of-accounts');

    $page->assertSee('Chart of Accounts')
        ->assertNoJavascriptErrors()
        ->assertNoConsoleLogs();
})->group('accounting', 'browser', 'coa');

it('can view chart of accounts details', function () {
    $page = visit("/accounting/chart-of-accounts/{$this->assetAccount->id}");

    $page->assertSee($this->assetAccount->code)
        ->assertSee($this->assetAccount->name)
        ->assertNoJavascriptErrors();
})->group('accounting', 'browser', 'coa');

/*
 * ============================================================================
 * JOURNAL ENTRY CREATION TESTS
 * ============================================================================
 */

it('can access journal entry creation page', function () {
    $page = visit('/accounting/journal-entries/create');

    $page->assertSee('Create Journal Entry')
        ->assertSee('Date')
        ->assertSee('Description')
        ->assertNoJavascriptErrors();
})->group('accounting', 'browser', 'journal-entry');

it('can create a balanced journal entry', function () {
    Event::fake();

    $page = visit('/accounting/journal-entries/create');

    $page->assertSee('Create Journal Entry')
        ->assertNoJavascriptErrors();

    // Create JE via service (form interaction would be complex)
    $service = app(\App\Domain\Finance\Services\CreateJournalEntryService::class);
    $entry = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null, // auto-generate
        description: 'Test Journal Entry from Browser Test',
        lines: [
            [
                'chart_of_account_id' => $this->assetAccount->id,
                'debit' => 10000,
                'credit' => 0,
                'description' => 'Debit line',
            ],
            [
                'chart_of_account_id' => $this->liabilityAccount->id,
                'debit' => 0,
                'credit' => 10000,
                'description' => 'Credit line',
            ],
        ],
        user: $this->user
    );

    // Navigate to show page
    $showPage = visit("/accounting/journal-entries/{$entry->id}");

    $showPage->assertSee($entry->reference_number)
        ->assertSee('Test Journal Entry')
        ->assertSee('10,000')
        ->assertSee('Draft')
        ->assertNoJavascriptErrors();

    // Verify entry is balanced
    expect($entry->isBalanced())->toBeTrue();
    expect($entry->getTotalDebit()->amount())->toBe(10000.0);
    expect($entry->getTotalCredit()->amount())->toBe(10000.0);

    // Verify event was dispatched
    Event::assertDispatched(\App\Domain\Finance\Events\JournalEntryCreated::class);
})->group('accounting', 'browser', 'journal-entry', 'critical');

it('displays validation error for unbalanced journal entry', function () {
    $service = app(\App\Domain\Finance\Services\CreateJournalEntryService::class);

    $this->expectException(InvalidArgumentException::class);
    $this->expectExceptionMessage('Journal Entry must be balanced');

    $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: 'JE-UNBALANCED',
        description: 'Unbalanced entry',
        lines: [
            [
                'chart_of_account_id' => $this->assetAccount->id,
                'debit' => 10000,
                'credit' => 0,
            ],
            [
                'chart_of_account_id' => $this->liabilityAccount->id,
                'debit' => 0,
                'credit' => 5000, // Unbalanced!
            ],
        ],
        user: $this->user
    );
})->group('accounting', 'browser', 'journal-entry');

/*
 * ============================================================================
 * JOURNAL ENTRY POSTING TESTS
 * ============================================================================
 */

it('can post a draft journal entry', function () {
    Event::fake();

    // Create draft entry
    $service = app(\App\Domain\Finance\Services\CreateJournalEntryService::class);
    $entry = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null,
        description: 'Entry to be posted',
        lines: [
            [
                'chart_of_account_id' => $this->assetAccount->id,
                'debit' => 50000,
                'credit' => 0,
            ],
            [
                'chart_of_account_id' => $this->liabilityAccount->id,
                'debit' => 0,
                'credit' => 50000,
            ],
        ],
        user: $this->user
    );

    expect($entry->status)->toBe('draft');
    expect($entry->canBePosted())->toBeTrue();

    // Post the entry
    $postService = app(\App\Domain\Finance\Services\PostJournalEntryService::class);
    $postedEntry = $postService->execute($entry, $this->user);

    // Visit show page after posting
    $page = visit("/accounting/journal-entries/{$postedEntry->id}");

    $page->assertSee('Posted')
        ->assertDontSee('Draft')
        ->assertNoJavascriptErrors();

    // Verify status
    expect($postedEntry->status)->toBe('posted');
    expect($postedEntry->isPosted())->toBeTrue();
    expect($postedEntry->canBeEdited())->toBeFalse();

    // Verify event was dispatched
    Event::assertDispatched(\App\Domain\Finance\Events\JournalEntryPosted::class);
})->group('accounting', 'browser', 'journal-entry', 'posting', 'critical');

it('cannot post an unbalanced journal entry', function () {
    // Create an entry and manually make it unbalanced
    $entry = JournalEntry::factory()->create([
        'status' => 'draft',
        'date' => now(),
    ]);

    // Add unbalanced lines
    $entry->lines()->create([
        'chart_of_account_id' => $this->assetAccount->id,
        'debit' => 10000,
        'credit' => 0,
    ]);

    expect($entry->isBalanced())->toBeFalse();
    expect($entry->canBePosted())->toBeFalse();

    $this->expectException(InvalidArgumentException::class);

    $postService = app(\App\Domain\Finance\Services\PostJournalEntryService::class);
    $postService->execute($entry, $this->user);
})->group('accounting', 'browser', 'journal-entry', 'posting');

/*
 * ============================================================================
 * JOURNAL ENTRY REVERSAL TESTS
 * ============================================================================
 */

it('can reverse a posted journal entry', function () {
    Event::fake();

    // Create and post entry
    $service = app(\App\Domain\Finance\Services\CreateJournalEntryService::class);
    $entry = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: 'JE-TO-REVERSE',
        description: 'Entry to be reversed',
        lines: [
            [
                'chart_of_account_id' => $this->revenueAccount->id,
                'debit' => 0,
                'credit' => 100000,
            ],
            [
                'chart_of_account_id' => $this->assetAccount->id,
                'debit' => 100000,
                'credit' => 0,
            ],
        ],
        user: $this->user
    );

    $postService = app(\App\Domain\Finance\Services\PostJournalEntryService::class);
    $postedEntry = $postService->execute($entry, $this->user);

    expect($postedEntry->isPosted())->toBeTrue();
    expect($postedEntry->hasBeenReversed())->toBeFalse();

    // Reverse the entry
    $reverseService = app(\App\Domain\Finance\Services\ReverseJournalEntryService::class);
    $reversalEntry = $reverseService->execute($postedEntry, $this->user, 'Correction needed');

    // Visit reversal entry page
    $page = visit("/accounting/journal-entries/{$reversalEntry->id}");

    $page->assertSee('REV') // Reference should contain -REV
        ->assertSee('Reversal of')
        ->assertSee('Posted')
        ->assertNoJavascriptErrors();

    // Verify reversal
    expect($reversalEntry->reference_number)->toContain('-REV');
    expect($reversalEntry->isPosted())->toBeTrue();
    expect($reversalEntry->reversed_entry_id)->toBe($postedEntry->id);

    // Verify original entry is marked as reversed
    expect($postedEntry->fresh()->hasBeenReversed())->toBeTrue();

    // Verify lines are swapped
    $originalFirstLine = $postedEntry->lines->first();
    $reversalFirstLine = $reversalEntry->lines->first();

    expect($reversalFirstLine->debit)->toBe($originalFirstLine->credit);
    expect($reversalFirstLine->credit)->toBe($originalFirstLine->debit);

    // Verify event was dispatched
    Event::assertDispatched(\App\Domain\Finance\Events\JournalEntryReversed::class);
})->group('accounting', 'browser', 'journal-entry', 'reversal', 'critical');

it('cannot reverse a draft journal entry', function () {
    $entry = JournalEntry::factory()->create(['status' => 'draft']);

    $this->expectException(InvalidArgumentException::class);
    $this->expectExceptionMessage('Only posted entries can be reversed');

    $reverseService = app(\App\Domain\Finance\Services\ReverseJournalEntryService::class);
    $reverseService->execute($entry, $this->user, 'Test');
})->group('accounting', 'browser', 'journal-entry', 'reversal');

/*
 * ============================================================================
 * REPORTING TESTS
 * ============================================================================
 */

it('can view general ledger for an account', function () {
    // Create some posted entries
    $service = app(\App\Domain\Finance\Services\CreateJournalEntryService::class);
    $postService = app(\App\Domain\Finance\Services\PostJournalEntryService::class);

    $entry1 = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null,
        description: 'GL Test Entry 1',
        lines: [
            ['chart_of_account_id' => $this->assetAccount->id, 'debit' => 10000, 'credit' => 0],
            ['chart_of_account_id' => $this->liabilityAccount->id, 'debit' => 0, 'credit' => 10000],
        ],
        user: $this->user
    );
    $postService->execute($entry1, $this->user);

    $entry2 = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null,
        description: 'GL Test Entry 2',
        lines: [
            ['chart_of_account_id' => $this->assetAccount->id, 'debit' => 5000, 'credit' => 0],
            ['chart_of_account_id' => $this->liabilityAccount->id, 'debit' => 0, 'credit' => 5000],
        ],
        user: $this->user
    );
    $postService->execute($entry2, $this->user);

    // Query GL
    $glQuery = app(\App\Domain\Finance\Queries\GetGeneralLedgerQuery::class);
    $period = \App\Domain\Finance\ValueObjects\AccountingPeriod::currentMonth();
    $gl = $glQuery->execute($this->assetAccount, $period);

    expect($gl)->toHaveCount(2);
    expect($gl->first()['debit']['amount'])->toBe(10000.0);
})->group('accounting', 'browser', 'reporting', 'gl');

it('can generate trial balance', function () {
    // Create multiple posted entries
    $service = app(\App\Domain\Finance\Services\CreateJournalEntryService::class);
    $postService = app(\App\Domain\Finance\Services\PostJournalEntryService::class);

    $entry = $service->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null,
        description: 'Trial Balance Test',
        lines: [
            ['chart_of_account_id' => $this->assetAccount->id, 'debit' => 75000, 'credit' => 0],
            ['chart_of_account_id' => $this->liabilityAccount->id, 'debit' => 0, 'credit' => 75000],
        ],
        user: $this->user
    );
    $postService->execute($entry, $this->user);

    // Query Trial Balance
    $tbQuery = app(\App\Domain\Finance\Queries\GetTrialBalanceQuery::class);
    $period = \App\Domain\Finance\ValueObjects\AccountingPeriod::currentMonth();
    $trialBalance = $tbQuery->execute($period);

    expect($trialBalance)->toHaveKey('accounts');
    expect($trialBalance)->toHaveKey('totals');
    expect($trialBalance['totals']['balanced'])->toBeTrue();
})->group('accounting', 'browser', 'reporting', 'trial-balance', 'critical');

/*
 * ============================================================================
 * INTEGRATION TESTS
 * ============================================================================
 */

it('completes full accounting cycle from creation to reversal', function () {
    Event::fake();

    // 1. Create Journal Entry
    $createService = app(\App\Domain\Finance\Services\CreateJournalEntryService::class);
    $entry = $createService->execute(
        date: now()->format('Y-m-d'),
        referenceNumber: null,
        description: 'Full Cycle Test Entry',
        lines: [
            ['chart_of_account_id' => $this->expenseAccount->id, 'debit' => 25000, 'credit' => 0],
            ['chart_of_account_id' => $this->assetAccount->id, 'debit' => 0, 'credit' => 25000],
        ],
        user: $this->user
    );

    expect($entry->status)->toBe('draft');
    expect($entry->isBalanced())->toBeTrue();

    // 2. Post Journal Entry
    $postService = app(\App\Domain\Finance\Services\PostJournalEntryService::class);
    $postedEntry = $postService->execute($entry, $this->user);

    expect($postedEntry->status)->toBe('posted');
    expect($postedEntry->canBeEdited())->toBeFalse();

    // 3. Reverse Journal Entry
    $reverseService = app(\App\Domain\Finance\Services\ReverseJournalEntryService::class);
    $reversalEntry = $reverseService->execute($postedEntry, $this->user, 'Testing full cycle');

    expect($reversalEntry->status)->toBe('posted');
    expect($reversalEntry->reference_number)->toContain('-REV');
    expect($postedEntry->fresh()->hasBeenReversed())->toBeTrue();

    // 4. Verify Events
    Event::assertDispatched(\App\Domain\Finance\Events\JournalEntryCreated::class);
    Event::assertDispatched(\App\Domain\Finance\Events\JournalEntryPosted::class);
    Event::assertDispatched(\App\Domain\Finance\Events\JournalEntryReversed::class);

    // 5. Visit all pages to ensure no errors
    $pages = [
        "/accounting/journal-entries/{$entry->id}",
        "/accounting/journal-entries/{$reversalEntry->id}",
    ];

    foreach ($pages as $url) {
        $page = visit($url);
        $page->assertNoJavascriptErrors();
    }
})->group('accounting', 'browser', 'e2e', 'critical');

it('navigates through all accounting module pages without errors', function () {
    $pages = [
        '/accounting/dashboard',
        '/accounting/chart-of-accounts',
        '/accounting/journal-entries',
    ];

    foreach ($pages as $url) {
        $page = visit($url);
        $page->assertNoJavascriptErrors()
            ->assertNoConsoleLogs();
    }
})->group('accounting', 'browser', 'smoke');
