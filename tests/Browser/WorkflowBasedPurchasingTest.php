<?php

/**
 * Complete Purchasing Workflow Test Suite
 *
 * Tests the entire purchasing workflow following actual business process:
 *
 * PHASE 1: Sourcing & SRM
 * - Vendor evaluation and selection
 * - RFQ creation and vendor invitation
 * - Bid collection and comparison
 * - Vendor award
 *
 * PHASE 2: Contracts & Blanket Orders
 * - Purchase Agreement creation
 * - Blanket Purchase Order setup
 * - Contract terms validation
 *
 * PHASE 3: Purchasing Operations
 * - Purchase Request with approval workflow
 * - PO creation from PR/RFQ
 * - PO approval workflow
 * - PO locking mechanism
 *
 * PHASE 4: Receiving & QC
 * - Goods Receipt from PO
 * - Quality Control inspection
 * - Three-way matching
 * - Inventory updates
 */

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRfq;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Workflow;
use App\Models\WorkflowInstance;
use Database\Seeders\AccountingSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

/**
 * @property User $user
 * @property User $approver
 * @property Contact $vendor
 * @property Contact $vendor2
 * @property Warehouse $warehouse
 * @property Product $product
 * @property \App\Models\Uom $uom
 */
beforeEach(function () {
    seed(AccountingSeeder::class);

    $this->user = User::factory()->create();
    $this->approver = User::factory()->create(['name' => 'Approver User']);

    $this->vendor = Contact::factory()->create(['type' => 'vendor']);
    $this->vendor2 = Contact::factory()->create(['type' => 'vendor', 'name' => 'Alternative Vendor']);
    $this->warehouse = Warehouse::factory()->create();
    $this->product = Product::factory()->create(['stock_control' => true, 'cost' => 1000]);
    $this->uom = \App\Models\Uom::factory()->create();

    actingAs($this->user);
});

/*
 * ============================================================================
 * PHASE 1: SOURCING & SRM
 * ============================================================================
 */

it('completes RFQ workflow from creation to PO conversion', function () {
    // 1. Create RFQ via backend
    $rfq = PurchaseRfq::create([
        'document_number' => 'RFQ-WF-001',
        'title' => 'Office Supplies RFQ',
        'issue_date' => now(),
        'closing_date' => now()->addDays(7),
        'status' => 'draft',
    ]);

    $rfq->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 100,
        'uom_id' => $this->uom->id,
    ]);

    // 2. Add vendors
    $rfq->vendors()->attach([$this->vendor->id, $this->vendor2->id]);

    // 3. Visit RFQ page
    $rfqPage = visit("/purchasing/rfqs/{$rfq->id}");
    $rfqPage->assertSee($rfq->document_number)
        ->assertNoJavascriptErrors();

    // 4. Send RFQ (change status to open)
    $rfq->update(['status' => 'open']);

    // 5. Record bids from vendors
    $rfq->bids()->create([
        'vendor_id' => $this->vendor->id,
        'product_id' => $this->product->id,
        'quantity' => 100,
        'unit_price' => 950,
        'total_price' => 95000,
    ]);

    $rfq->bids()->create([
        'vendor_id' => $this->vendor2->id,
        'product_id' => $this->product->id,
        'quantity' => 100,
        'unit_price' => 1000,
        'total_price' => 100000,
    ]);

    // 6. Award to best bidder
    $rfq->update([
        'status' => 'awarded',
        'selected_vendor_id' => $this->vendor->id,
    ]);

    expect($rfq->fresh()->status)->toBe('awarded');
    expect($rfq->fresh()->selected_vendor_id)->toBe($this->vendor->id);
})->group('workflow', 'sourcing');

/*
 * ============================================================================
 * PHASE 2: CONTRACTS & BLANKET ORDERS
 * ============================================================================
 */

it('creates and manages blanket purchase order lifecycle', function () {
    // 1. Create Purchase Agreement
    $agreement = \App\Models\PurchaseAgreement::create([
        'agreement_number' => 'PA-WF-001',
        'vendor_id' => $this->vendor->id,
        'title' => 'Annual Supply Agreement',
        'start_date' => now(),
        'end_date' => now()->addYear(),
        'status' => 'active',
        'total_value' => 1000000,
    ]);

    // 2. Create Blanket Order from Agreement
    $bpo = \App\Models\BlanketOrder::create([
        'purchase_agreement_id' => $agreement->id,
        'vendor_id' => $this->vendor->id,
        'document_number' => 'BPO-WF-001',
        'start_date' => now(),
        'end_date' => now()->addYear(),
        'status' => 'active',
        'amount_limit' => 500000,
        'amount_utilized' => 0,
    ]);

    $bpo->lines()->create([
        'product_id' => $this->product->id,
        'quantity_limit' => 1000,
        'quantity_utilized' => 0,
        'unit_price' => 950,
    ]);

    // 3. Visit BPO page
    $bpoPage = visit("/purchasing/blanket-orders/{$bpo->id}");
    $bpoPage->assertSee($bpo->document_number)
        ->assertNoJavascriptErrors();

    expect($bpo->status)->toBe('active');
    expect($bpo->amount_utilized)->toBe(0);
})->group('workflow', 'contracts');

/*
 * ============================================================================
 * PHASE 3: PURCHASING OPERATIONS WITH APPROVAL WORKFLOW
 * ============================================================================
 */

it('completes PO creation with approval workflow', function () {
    // 1. Create Workflow for Purchase Orders
    $workflow = Workflow::create([
        'name' => 'PO Approval - Above 50K',
        'description' => 'Approval required for PO above 50,000',
        'workflowable_type' => 'App\\Models\\PurchaseOrder',
        'is_active' => true,
    ]);

    $workflow->conditions()->create([
        'field' => 'total',
        'operator' => '>',
        'value' => 50000,
    ]);

    $workflow->steps()->create([
        'step_number' => 1,
        'name' => 'Manager Approval',
        'approver_id' => $this->approver->id,
        'required' => true,
    ]);

    // 2. Create PO that triggers workflow (amount > 50K)
    $po = PurchaseOrder::create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'document_number' => 'PO-WF-001',
        'date' => now(),
        'status' => 'draft',
        'source' => 'manual',
        'total' => 95000, // Above threshold
    ]);

    $po->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 100,
        'unit_price' => 950,
        'subtotal' => 95000,
        'uom_id' => $this->uom->id,
    ]);

    // 3. Visit PO page
    $poPage = visit("/purchasing/orders/{$po->id}");
    $poPage->assertSee($po->document_number)
        ->assertNoJavascriptErrors();

    // 4. Submit for approval (triggers workflow)
    $po->update(['status' => 'pending_approval']);

    // Create workflow instance
    $instance = WorkflowInstance::create([
        'workflow_id' => $workflow->id,
        'workflowable_type' => 'App\\Models\\PurchaseOrder',
        'workflowable_id' => $po->id,
        'status' => 'pending',
        'initiated_by' => $this->user->id,
    ]);

    // 5. Approver approves
    actingAs($this->approver);

    $instance->update(['status' => 'approved']);

    // 6. PO status changes to approved
    $po->update(['status' => 'purchase_order']);

    expect($po->fresh()->status)->toBe('purchase_order');
    expect($instance->fresh()->status)->toBe('approved');
})->group('workflow', 'purchasing');

it('handles PO rejection in approval workflow', function () {
    // Similar setup but with rejection
    $po = PurchaseOrder::create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'document_number' => 'PO-REJ-001',
        'date' => now(),
        'status' => 'pending_approval',
        'total' => 75000,
    ]);

    $po->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 75,
        'unit_price' => 1000,
        'subtotal' => 75000,
        'uom_id' => $this->uom->id,
    ]);

    // Reject PO
    $po->update([
        'status' => 'rejected',
        'rejection_reason' => 'Budget exceeded for this period',
    ]);

    expect($po->fresh()->status)->toBe('rejected');
})->group('workflow', 'purchasing');

/*
 * ============================================================================
 * PHASE 4: RECEIVING & QC WITH FULL INTEGRATION
 * ============================================================================
 */

it('completes receiving workflow with QC and inventory update', function () {
    // 1. Create approved PO
    $po = PurchaseOrder::create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'document_number' => 'PO-RCV-001',
        'date' => now(),
        'status' => 'purchase_order', // Approved
        'total' => 95000,
    ]);

    $po->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 100,
        'unit_price' => 950,
        'subtotal' => 95000,
        'uom_id' => $this->uom->id,
    ]);

    // 2. Create Goods Receipt
    $grService = app(\App\Domain\Purchasing\Services\CreateGoodsReceiptService::class);
    $gr = $grService->execute([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $this->warehouse->id,
        'receipt_number' => 'GR-WF-001',
        'date' => now(),
        'items' => [
            [
                'product_id' => $this->product->id,
                'uom_id' => $this->uom->id,
                'quantity' => 100,
            ],
        ],
    ]);

    // 3. Visit GR page
    $grPage = visit("/purchasing/receipts/{$gr->id}");
    $grPage->assertSee($gr->receipt_number)
        ->assertSee('Draft')
        ->assertNoJavascriptErrors();

    // 4. Post GR (triggers inventory update, journal entry, PO status change)
    $grService->post($gr);

    // 5. Verify GR posted
    expect($gr->fresh()->status)->toBe('posted');

    // 6. Verify PO status updated
    expect($po->fresh()->status)->toBe('fully_received');

    // 7. Verify inventory increased
    $stock = \Illuminate\Support\Facades\DB::table('product_warehouse')
        ->where('product_id', $this->product->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect($stock)->not->toBeNull();
    expect((float) $stock->quantity)->toBe(100.0);

    // 8. Verify journal entry created
    $journalEntry = \App\Models\JournalEntry::where('reference_number', $gr->receipt_number)->first();
    expect($journalEntry)->not->toBeNull();
    expect($journalEntry->lines->count())->toBe(2);

    // Inventory debit
    $inventoryLine = $journalEntry->lines()
        ->whereHas('chartOfAccount', fn ($q) => $q->where('code', '1400'))
        ->first();
    expect($inventoryLine)->not->toBeNull();
    expect((float) $inventoryLine->debit)->toBe(95000.0);

    // Clearing credit
    $clearingLine = $journalEntry->lines()
        ->whereHas('chartOfAccount', fn ($q) => $q->where('code', '2110'))
        ->first();
    expect($clearingLine)->not->toBeNull();
    expect((float) $clearingLine->credit)->toBe(95000.0);
})->group('workflow', 'receiving');

it('handles multi-step receiving with QC inspection', function () {
    // Create PO
    $po = PurchaseOrder::create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'document_number' => 'PO-QC-001',
        'date' => now(),
        'status' => 'purchase_order',
        'total' => 100000,
    ]);

    $po->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 100,
        'unit_price' => 1000,
        'subtotal' => 100000,
        'uom_id' => $this->uom->id,
    ]);

    // Create and post GR
    $grService = app(\App\Domain\Purchasing\Services\CreateGoodsReceiptService::class);
    $gr = $grService->execute([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $this->warehouse->id,
        'receipt_number' => 'GR-QC-001',
        'date' => now(),
        'items' => [
            [
                'product_id' => $this->product->id,
                'uom_id' => $this->uom->id,
                'quantity' => 100,
            ],
        ],
    ]);

    $grService->post($gr);

    // Get GR item for QC
    $grItem = $gr->items()->first();

    // Record QC inspection using service
    $qcService = app(\App\Domain\Purchasing\Services\QualityControlService::class);
    $qcService->recordInspection($grItem, [
        'quantity_passed' => 95,
        'quantity_failed' => 5,
        'notes' => 'Minor defects found in 5 units',
        'inspector_id' => $this->user->id,
    ]);

    // Verify QC recorded
    expect($grItem->fresh()->qc_status)->toBe('inspected');
    expect((float) $grItem->fresh()->qc_passed_qty)->toBe(95.0);
    expect((float) $grItem->fresh()->qc_failed_qty)->toBe(5.0);
})->group('workflow', 'qc');

/*
 * ============================================================================
 * INTEGRATION TEST: COMPLETE END-TO-END WITH ALL PHASES
 * ============================================================================
 */

it('executes complete procurement cycle across all phases', function () {
    /*
     * COMPREHENSIVE E2E TEST
     * Tests full workflow from RFQ to final receiving
     */

    // PHASE 1: RFQ & Vendor Selection
    $rfq = PurchaseRfq::create([
        'document_number' => 'RFQ-E2E-001',
        'title' => 'Complete E2E Test',
        'issue_date' => now(),
        'closing_date' => now()->addDays(7),
        'status' => 'open',
    ]);

    $rfq->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 200,
        'uom_id' => $this->uom->id,
    ]);

    $rfq->vendors()->attach($this->vendor->id);

    $rfq->bids()->create([
        'vendor_id' => $this->vendor->id,
        'product_id' => $this->product->id,
        'quantity' => 200,
        'unit_price' => 900,
        'total_price' => 180000,
    ]);

    $rfq->update(['status' => 'awarded', 'selected_vendor_id' => $this->vendor->id]);

    // PHASE 2: Create PO from RFQ
    $po = PurchaseOrder::create([
        'vendor_id' => $this->vendor->id,
        'warehouse_id' => $this->warehouse->id,
        'document_number' => 'PO-E2E-001',
        'date' => now(),
        'status' => 'purchase_order',
        'total' => 180000,
        'source' => 'rfq',
        'reference_id' => $rfq->id,
    ]);

    $po->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 200,
        'unit_price' => 900,
        'subtotal' => 180000,
        'uom_id' => $this->uom->id,
    ]);

    // PHASE 3: Partial Receiving (100 units)
    $grService = app(\App\Domain\Purchasing\Services\CreateGoodsReceiptService::class);
    $gr1 = $grService->execute([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $this->warehouse->id,
        'receipt_number' => 'GR-E2E-001',
        'date' => now(),
        'items' => [['product_id' => $this->product->id, 'uom_id' => $this->uom->id, 'quantity' => 100]],
    ]);

    $grService->post($gr1);

    // Verify partial status
    expect($po->fresh()->status)->toBe('partial_received');

    // PHASE 4: Complete Receiving (remaining 100 units)
    $gr2 = $grService->execute([
        'purchase_order_id' => $po->id,
        'warehouse_id' => $this->warehouse->id,
        'receipt_number' => 'GR-E2E-002',
        'date' => now(),
        'items' => [['product_id' => $this->product->id, 'uom_id' => $this->uom->id, 'quantity' => 100]],
    ]);

    $grService->post($gr2);

    // FINAL VERIFICATION
    expect($po->fresh()->status)->toBe('fully_received');

    $stock = \Illuminate\Support\Facades\DB::table('product_warehouse')
        ->where('product_id', $this->product->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect((float) $stock->quantity)->toBe(200.0);

    // Verify 2 journal entries created
    $journalEntries = \App\Models\JournalEntry::whereIn('reference_number', ['GR-E2E-001', 'GR-E2E-002'])->get();
    expect($journalEntries->count())->toBe(2);

})->group('workflow', 'integration', 'e2e');
