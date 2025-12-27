<?php

use App\Models\AccountingPeriod;
use App\Models\JournalEntry;
use App\Models\User;
use Database\Seeders\AccountingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(AccountingSeeder::class);
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('can create accounting period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    expect($period)->toBeInstanceOf(AccountingPeriod::class)
        ->and($period->name)->toBe('2025-01')
        ->and($period->status)->toBe('open')
        ->and($period->start_date->format('Y-m-d'))->toBe('2025-01-01')
        ->and($period->end_date->format('Y-m-d'))->toBe('2025-01-31');
});

test('can lock accounting period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    $period->lock($this->user, 'Monthly closing for January');

    expect($period->fresh()->status)->toBe('locked')
        ->and($period->fresh()->locked_by)->toBe($this->user->id)
        ->and($period->fresh()->lock_notes)->toBe('Monthly closing for January')
        ->and($period->fresh()->locked_at)->not->toBeNull();
});

test('can unlock accounting period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);
    $period->lock($this->user);

    $period->unlock($this->user);

    expect($period->fresh()->status)->toBe('open')
        ->and($period->fresh()->unlocked_by)->toBe($this->user->id)
        ->and($period->fresh()->unlocked_at)->not->toBeNull();
});

test('cannot lock already locked period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);
    $period->lock($this->user);

    $period->lock($this->user);
})->throws(DomainException::class, 'already locked');

test('cannot unlock already open period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    $period->unlock($this->user);
})->throws(DomainException::class, 'already open');

test('cannot create journal entry in locked period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);
    $period->lock($this->user);

    $entry = JournalEntry::create([
        'reference_number' => 'JE-001',
        'date' => '2025-01-15',
        'description' => 'Test Entry',
        'status' => 'draft',
    ]);
})->throws(DomainException::class, 'period 2025-01 is locked');

test('can create journal entry in open period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    $entry = JournalEntry::create([
        'reference_number' => 'JE-001',
        'date' => '2025-01-15',
        'description' => 'Test Entry',
        'status' => 'draft',
    ]);

    expect($entry)->toBeInstanceOf(JournalEntry::class)
        ->and($entry->reference_number)->toBe('JE-001');
});

test('cannot update journal entry in locked period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    $entry = JournalEntry::create([
        'reference_number' => 'JE-001',
        'date' => '2025-01-15',
        'description' => 'Test Entry',
        'status' => 'draft',
    ]);

    // Now lock the period
    $period->lock($this->user);

    // Try to update
    $entry->update(['description' => 'Updated description']);
})->throws(DomainException::class, 'is locked');

test('cannot delete journal entry in locked period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    $entry = JournalEntry::create([
        'reference_number' => 'JE-001',
        'date' => '2025-01-15',
        'description' => 'Test Entry',
        'status' => 'draft',
    ]);

    // Lock the period
    $period->lock($this->user);

    // Try to delete
    $entry->delete();
})->throws(DomainException::class, 'is locked');

test('can edit journal entry after unlocking period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    $entry = JournalEntry::create([
        'reference_number' => 'JE-001',
        'date' => '2025-01-15',
        'description' => 'Test Entry',
        'status' => 'draft',
    ]);

    // Lock then unlock
    $period->lock($this->user);
    $period->unlock($this->user);

    // Should now be able to update
    $entry->update(['description' => 'Updated description']);

    expect($entry->fresh()->description)->toBe('Updated description');
});

test('scope forDate returns correct period', function () {
    $period1 = AccountingPeriod::createMonthly(2025, 1);
    $period2 = AccountingPeriod::createMonthly(2025, 2);

    $found = AccountingPeriod::forDate('2025-01-15')->first();

    expect($found->id)->toBe($period1->id);
});

test('canBeEdited returns false for entry in locked period', function () {
    $period = AccountingPeriod::createMonthly(2025, 1);

    $entry = JournalEntry::create([
        'reference_number' => 'JE-001',
        'date' => '2025-01-15',
        'description' => 'Test Entry',
        'status' => 'draft',
    ]);

    expect($entry->canBeEdited())->toBeTrue();

    $period->lock($this->user);

    // Need to refresh the entry to check again
    expect($entry->fresh()->canBeEdited())->toBeFalse();
});
