<?php

use App\Domain\Purchasing\Services\DebitNoteService;
use App\Models\Contact;
use App\Models\DebitNote;
use App\Models\PurchaseReturn;
use App\Models\User;
use App\Models\VendorBill;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('can create debit note manually', function () {
    $vendor = Contact::factory()->vendor()->create();

    $response = $this->postJson('/purchasing/debit-notes', [
        'vendor_id' => $vendor->id,
        'date' => now()->format('Y-m-d'),
        'total_amount' => 1000,
        'reference_number' => 'REF-001',
        'notes' => 'Test debit note',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('debit_notes', [
        'vendor_id' => $vendor->id,
        'total_amount' => 1000,
        'status' => 'unposted',
    ]);
});

test('can post debit note and create journal entry', function () {
    $debitNote = DebitNote::factory()->create(['status' => 'unposted']);

    $response = $this->post("/purchasing/debit-notes/{$debitNote->id}/post");

    $response->assertRedirect();
    $this->assertDatabaseHas('debit_notes', [
        'id' => $debitNote->id,
        'status' => 'posted',
    ]);

    // TODO: Journal entry integration - implement later
    // $this->assertDatabaseHas('journal_entries', [
    //     'source_type' => 'App\Models\DebitNote',
    //     'source_id' => $debitNote->id,
    // ]);
});

test('can apply debit note to vendor bill', function () {
    $vendor = Contact::factory()->vendor()->create();
    $debitNote = DebitNote::factory()->create([
        'vendor_id' => $vendor->id,
        'status' => 'posted',
        'total_amount' => 1000,
        'remaining_amount' => 1000,
    ]);

    $bill = VendorBill::factory()->create([
        'vendor_id' => $vendor->id,
        'total_amount' => 2000,
        'status' => 'posted',
    ]);

    $response = $this->post("/purchasing/debit-notes/{$debitNote->id}/apply", [
        'vendor_bill_id' => $bill->id,
        'amount' => 500,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('debit_note_applications', [
        'debit_note_id' => $debitNote->id,
        'vendor_bill_id' => $bill->id,
        'amount_applied' => 500,
    ]);

    $this->assertDatabaseHas('debit_notes', [
        'id' => $debitNote->id,
        'applied_amount' => 500,
        'remaining_amount' => 500,
        'status' => 'partially_applied',
    ]);
});

test('can void debit note', function () {
    $debitNote = DebitNote::factory()->create([
        'status' => 'posted',
        'remaining_amount' => 1000,
    ]);

    $response = $this->post("/purchasing/debit-notes/{$debitNote->id}/void", [
        'reason' => 'Created in error',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('debit_notes', [
        'id' => $debitNote->id,
        'status' => 'voided',
        'void_reason' => 'Created in error',
    ]);
});

test('debit note auto-created from return', function () {
    $return = PurchaseReturn::factory()->create([
        'status' => 'received_by_vendor',
        'total_amount' => 1500,
    ]);

    $debitNoteService = app(DebitNoteService::class);
    $debitNote = $debitNoteService->createFromReturn($return);

    expect($debitNote)->toBeInstanceOf(DebitNote::class);
    expect($debitNote->purchase_return_id)->toBe($return->id);
    expect((float) $debitNote->total_amount)->toBe(1500.0);
    expect($debitNote->status)->toBe('unposted');
});

test('cannot apply more than remaining amount', function () {
    $debitNote = DebitNote::factory()->create([
        'status' => 'posted',
        'total_amount' => 1000,
        'remaining_amount' => 500,
    ]);

    $bill = VendorBill::factory()->create();

    $this->expectException(\Exception::class);

    app(DebitNoteService::class)->applyToInvoice($debitNote, $bill, 600);
});

test('debit note status updates correctly', function () {
    $debitNote = DebitNote::factory()->create([
        'status' => 'posted',
        'total_amount' => 1000,
        'remaining_amount' => 1000,
    ]);

    $bill = VendorBill::factory()->create(['vendor_id' => $debitNote->vendor_id]);

    // Apply partially
    app(DebitNoteService::class)->applyToInvoice($debitNote, $bill, 400);
    expect($debitNote->fresh()->status)->toBe('partially_applied');

    // Apply rest
    app(DebitNoteService::class)->applyToInvoice($debitNote->fresh(), $bill, 600);
    expect($debitNote->fresh()->status)->toBe('applied');
});
