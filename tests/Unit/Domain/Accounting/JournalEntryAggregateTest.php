<?php

use App\Domain\Accounting\Aggregates\JournalEntry\JournalEntry;
use App\Domain\Accounting\Aggregates\JournalEntry\JournalLine;
use App\Domain\Shared\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can create journal entry aggregate', function () {
    $entry = JournalEntry::create(
        'JE-TEST-001',
        new \DateTimeImmutable('2025-01-15'),
        'Test Journal Entry',
        1, // periodId
        'IDR' // currency
    );

    expect($entry)->toBeInstanceOf(JournalEntry::class)
        ->and($entry->getReferenceNumber())->toBe('JE-TEST-001')
        ->and($entry->isDraft())->toBeTrue();
});

test('can add journal lines', function () {
    $entry = JournalEntry::create(
        'JE-TEST-001',
        new \DateTimeImmutable('2025-01-15'),
        'Test Journal Entry',
        1, // periodId
        'IDR' // currency
    );

    $entry->addLine(
        JournalLine::debit(1100, Money::from(1000, 'IDR'), 'Cash debit')
    );

    $entry->addLine(
        JournalLine::credit(4100, Money::from(1000, 'IDR'), 'Revenue credit')
    );

    expect($entry->getLines())->toHaveCount(2)
        ->and($entry->isBalanced())->toBeTrue();
});

test('detects unbalanced entry', function () {
    $entry = JournalEntry::create(
        'JE-TEST-001',
        new \DateTimeImmutable('2025-01-15'),
        'Test Journal Entry',
        1, // periodId
        'IDR' // currency
    );

    $entry->addLine(
        JournalLine::debit(1100, Money::from(1000, 'IDR'))
    );

    $entry->addLine(
        JournalLine::credit(4100, Money::from(500, 'IDR')) // Unbalanced!
    );

    expect($entry->isBalanced())->toBeFalse();
});

test('cannot post unbalanced entry', function () {
    $entry = JournalEntry::create(
        'JE-TEST-001',
        new \DateTimeImmutable('2025-01-15'),
        'Test Journal Entry',
        1, // periodId
        'IDR' // currency
    );

    $entry->addLine(JournalLine::debit(1100, Money::from(1000, 'IDR')));
    $entry->addLine(JournalLine::credit(4100, Money::from(500, 'IDR')));

    $entry->post(); // No parameters needed
})->throws(DomainException::class, 'not balanced');

test('can post balanced entry', function () {
    $entry = JournalEntry::create(
        'JE-TEST-001',
        new \DateTimeImmutable('2025-01-15'),
        'Test Journal Entry',
        1, // periodId
        'IDR' // currency
    );

    $entry->addLine(JournalLine::debit(1100, Money::from(1000, 'IDR')));
    $entry->addLine(JournalLine::credit(4100, Money::from(1000, 'IDR')));

    $entry->post();

    expect($entry->isPosted())->toBeTrue();
});

test('cannot add lines to posted entry', function () {
    $entry = JournalEntry::create(
        'JE-TEST-001',
        new \DateTimeImmutable('2025-01-15'),
        'Test Journal Entry',
        1, // periodId
        'IDR' // currency
    );

    $entry->addLine(JournalLine::debit(1100, Money::from(1000, 'IDR')));
    $entry->addLine(JournalLine::credit(4100, Money::from(1000, 'IDR')));
    $entry->post();

    $entry->addLine(JournalLine::debit(1100, Money::from(500, 'IDR')));
})->throws(DomainException::class, 'Cannot add lines to a posted');
