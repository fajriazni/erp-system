<?php

use App\Domain\Purchasing\Services\VendorClaimService;
use App\Models\Contact;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\VendorClaim;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('can submit vendor claim', function () {
    $vendor = Contact::factory()->vendor()->create();
    $po = PurchaseOrder::factory()->create();

    $response = $this->postJson('/purchasing/claims', [
        'vendor_id' => $vendor->id,
        'purchase_order_id' => $po->id,
        'claim_type' => 'damaged_goods',
        'claim_amount' => 500,
        'description' => 'Items arrived damaged',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vendor_claims', [
        'vendor_id' => $vendor->id,
        'claim_type' => 'damaged_goods',
        'claim_amount' => 500,
        'status' => 'submitted',
    ]);
});

test('can review claim', function () {
    $claim = VendorClaim::factory()->create(['status' => 'submitted']);

    $response = $this->post("/purchasing/claims/{$claim->id}/review");

    $response->assertRedirect();
    $this->assertDatabaseHas('vendor_claims', [
        'id' => $claim->id,
        'status' => 'under_review',
    ]);
});

test('can approve claim', function () {
    $claim = VendorClaim::factory()->create(['status' => 'under_review']);

    $response = $this->post("/purchasing/claims/{$claim->id}/approve");

    $response->assertRedirect();
    $this->assertDatabaseHas('vendor_claims', [
        'id' => $claim->id,
        'status' => 'approved',
    ]);
});

test('can settle claim with credit note', function () {
    $claim = VendorClaim::factory()->create([
        'status' => 'approved',
        'claim_amount' => 1000,
    ]);

    $response = $this->post("/purchasing/claims/{$claim->id}/settle", [
        'settlement_type' => 'credit_note',
        'settlement_amount' => 1000,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vendor_claims', [
        'id' => $claim->id,
        'status' => 'settled',
        'settlement_type' => 'credit_note',
        'settlement_amount' => 1000,
    ]);

    // Should auto-create debit note
    $this->assertDatabaseHas('debit_notes', [
        'total_amount' => 1000,
    ]);
});

test('can dispute claim', function () {
    $claim = VendorClaim::factory()->create(['status' => 'under_review']);

    $response = $this->post("/purchasing/claims/{$claim->id}/dispute", [
        'reason' => 'Claim amount too high',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vendor_claims', [
        'id' => $claim->id,
        'status' => 'disputed',
    ]);
});

test('can reject claim', function () {
    $claim = VendorClaim::factory()->create(['status' => 'submitted']);

    $response = $this->post("/purchasing/claims/{$claim->id}/reject", [
        'reason' => 'No evidence provided',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vendor_claims', [
        'id' => $claim->id,
        'status' => 'rejected',
    ]);
});

test('claim workflow progression', function () {
    $claim = VendorClaim::factory()->create(['status' => 'submitted']);

    expect($claim->status)->toBe('submitted');

    $claim->review($this->user);
    expect($claim->fresh()->status)->toBe('under_review');

    $claim->fresh()->approve();
    expect($claim->fresh()->status)->toBe('approved');

    app(VendorClaimService::class)->settle($claim->fresh(), [
        'settlement_type' => 'refund',
        'settlement_amount' => 500,
    ]);
    expect($claim->fresh()->status)->toBe('settled');
});

test('cannot settle unapproved claim', function () {
    $claim = VendorClaim::factory()->create(['status' => 'submitted']);

    $this->expectException(\Exception::class);

    app(VendorClaimService::class)->settle($claim, [
        'settlement_type' => 'refund',
        'settlement_amount' => 500,
    ]);
});

test('claim with evidence attachments', function () {
    $vendor = Contact::factory()->vendor()->create();

    $response = $this->postJson('/purchasing/claims', [
        'vendor_id' => $vendor->id,
        'claim_type' => 'quality_issue',
        'claim_amount' => 300,
        'description' => 'Poor quality items',
        'evidence_attachments' => ['photo1.jpg', 'photo2.jpg'],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vendor_claims', [
        'vendor_id' => $vendor->id,
        'claim_type' => 'quality_issue',
    ]);
});
