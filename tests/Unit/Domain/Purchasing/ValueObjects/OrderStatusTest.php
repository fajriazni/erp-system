<?php

use App\Domain\Purchasing\ValueObjects\OrderStatus;

test('can create order status from string', function () {
    $status = OrderStatus::from('draft');
    
    expect($status->value())->toBe('draft')
        ->and($status->isDraft())->toBeTrue();
});

test('can create order status using named constructors', function () {
    expect(OrderStatus::draft()->isDraft())->toBeTrue()
        ->and(OrderStatus::toApprove()->isToApprove())->toBeTrue()
        ->and(OrderStatus::open()->isOpen())->toBeTrue()
        ->and(OrderStatus::partiallyReceived()->isPartiallyReceived())->toBeTrue()
        ->and(OrderStatus::closed()->isClosed())->toBeTrue()
        ->and(OrderStatus::cancelled()->isCancelled())->toBeTrue();
});

test('throws exception for invalid status', function () {
    OrderStatus::from('invalid_status');
})->throws(InvalidArgumentException::class);

test('draft status can be edited and submitted', function () {
    $status = OrderStatus::draft();
    
    expect($status->canEdit())->toBeTrue()
        ->and($status->canSubmit())->toBeTrue()
        ->and($status->canApprove())->toBeFalse();
});

test('to_approve status can be approved but not edited', function () {
    $status = OrderStatus::toApprove();
    
    expect($status->canEdit())->toBeFalse()
        ->and($status->canSubmit())->toBeFalse()
        ->and($status->canApprove())->toBeTrue();
});

test('open and partially_received statuses can receive goods', function () {
    expect(OrderStatus::open()->canReceive())->toBeTrue()
        ->and(OrderStatus::partiallyReceived()->canReceive())->toBeTrue()
        ->and(OrderStatus::draft()->canReceive())->toBeFalse()
        ->and(OrderStatus::closed()->canReceive())->toBeFalse();
});

test('cancelled and closed statuses cannot be cancelled again', function () {
    expect(OrderStatus::cancelled()->canCancel())->toBeFalse()
        ->and(OrderStatus::closed()->canCancel())->toBeFalse()
        ->and(OrderStatus::draft()->canCancel())->toBeTrue()
        ->and(OrderStatus::open()->canCancel())->toBeTrue();
});

test('provides correct labels', function () {
    expect(OrderStatus::draft()->label())->toBe('Draft')
        ->and(OrderStatus::toApprove()->label())->toBe('Pending Approval')
        ->and(OrderStatus::open()->label())->toBe('Open')
        ->and(OrderStatus::partiallyReceived()->label())->toBe('Partially Received')
        ->and(OrderStatus::closed()->label())->toBe('Closed')
        ->and(OrderStatus::cancelled()->label())->toBe('Cancelled');
});

test('provides indonesian descriptions', function () {
    $status = OrderStatus::draft();
    
    expect($status->description())->toBe('Masih draf kasar');
});

test('provides stock effect information', function () {
    expect(OrderStatus::draft()->stockEffect())->toBe('Belum ada efek')
        ->and(OrderStatus::open()->stockEffect())->toBe('Expected Stock (Committed)')
        ->and(OrderStatus::closed()->stockEffect())->toBe('Stok penuh & Hutang lunas');
});

test('can check equality of statuses', function () {
    $status1 = OrderStatus::draft();
    $status2 = OrderStatus::draft();
    $status3 = OrderStatus::open();
    
    expect($status1->equals($status2))->toBeTrue()
        ->and($status1->equals($status3))->toBeFalse();
});

test('can get all valid statuses', function () {
    $allStatuses = OrderStatus::all();
    
    expect($allStatuses)->toHaveCount(6)
        ->and($allStatuses)->toContain('draft', 'to_approve', 'open', 'partially_received', 'closed', 'cancelled');
});

test('can validate if status string is valid', function () {
    expect(OrderStatus::isValid('draft'))->toBeTrue()
        ->and(OrderStatus::isValid('invalid'))->toBeFalse();
});
