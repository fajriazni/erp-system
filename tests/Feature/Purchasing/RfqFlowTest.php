<?php

namespace Tests\Feature\Purchasing;

use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseRfq;
use App\Models\Uom;
use App\Models\User;
use App\Models\VendorQuotation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RfqFlowTest extends TestCase
{
    use RefreshDatabase;

    // protected User $user; // already in parent
    protected Contact $vendor;

    protected Product $product;

    protected Uom $uom;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->uom = Uom::factory()->create(['name' => 'Pieces', 'symbol' => 'Pcs']);
        $this->vendor = Contact::factory()->create(['type' => 'vendor', 'name' => 'Acme Supplies']);
        $this->product = Product::factory()->create(['name' => 'Test Widget', 'uom_id' => $this->uom->id]);

        // Ensure validation of warehouse_id foreign key passes in Award service
        \App\Models\Warehouse::factory()->create(['id' => 1, 'name' => 'Main Warehouse']);
    }

    public function test_can_create_rfq()
    {
        $response = $this->actingAs($this->user)->post(route('purchasing.rfqs.store'), [
            'title' => 'Test RFQ',
            'deadline' => now()->addDays(7)->toDateString(),
            'notes' => 'Urgent',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 10,
                    'uom_id' => $this->uom->id,
                    'target_price' => 100,
                    'notes' => 'Sample',
                ],
            ],
        ]);

        $response->assertRedirect(route('purchasing.rfqs.index'));

        $this->assertDatabaseHas('purchase_rfqs', [
            'title' => 'Test RFQ',
            'created_by' => $this->user->id,
            'status' => 'draft',
        ]);

        $this->assertDatabaseHas('purchase_rfq_lines', [
            'product_id' => $this->product->id,
            'quantity' => 10,
            'uom_id' => $this->uom->id,
        ]);
    }

    public function test_can_invite_vendors()
    {
        $rfq = PurchaseRfq::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->post(route('purchasing.rfqs.invite', $rfq), [
            'vendor_ids' => [$this->vendor->id],
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('rfq_vendors', [
            'purchase_rfq_id' => $rfq->id,
            'vendor_id' => $this->vendor->id,
            'status' => 'sent',
        ]);
    }

    public function test_can_record_vendor_bid()
    {
        $rfq = PurchaseRfq::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->post(route('purchasing.rfqs.bid', $rfq), [
            'vendor_id' => $this->vendor->id,
            'reference_number' => 'Q-123',
            'quote_date' => now()->toDateString(),
            'valid_until' => now()->addDays(30)->toDateString(),
            'currency' => 'IDR',
            'notes' => 'Best price',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 10,
                    'unit_price' => 15000,
                    'notes' => 'Included tax',
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('vendor_quotations', [
            'purchase_rfq_id' => $rfq->id,
            'vendor_id' => $this->vendor->id,
            'reference_number' => 'Q-123',
            'total_amount' => 150000,
            'status' => 'submitted',
        ]);

        $this->assertDatabaseHas('vendor_quotation_lines', [
            'product_id' => $this->product->id,
            'unit_price' => 15000,
        ]);
    }

    public function test_can_award_vendor_bid()
    {
        $rfq = PurchaseRfq::factory()->create(['user_id' => $this->user->id]);
        $quotation = VendorQuotation::create([
            'purchase_rfq_id' => $rfq->id,
            'vendor_id' => $this->vendor->id,
            'reference_number' => 'Q-WINNER',
            'total_amount' => 100000,
            'status' => 'submitted',
        ]);

        $quotation->lines()->create([
            'product_id' => $this->product->id,
            'quantity' => 10,
            'unit_price' => 10000,
            'subtotal' => 100000,
        ]);

        // Another loser bid
        $loser = VendorQuotation::create([
            'purchase_rfq_id' => $rfq->id,
            'vendor_id' => Contact::factory()->create(['type' => 'vendor'])->id,
            'reference_number' => 'Q-LOSER',
            'total_amount' => 200000,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->user)->post(route('purchasing.quotations.award', $quotation));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(); // Should redirect to PO show

        $this->assertDatabaseHas('vendor_quotations', [
            'id' => $quotation->id,
            'status' => 'won',
            'is_awarded' => true,
        ]);

        $this->assertDatabaseHas('vendor_quotations', [
            'id' => $loser->id,
            'status' => 'lost',
        ]);

        $this->assertDatabaseHas('purchase_rfqs', [
            'id' => $rfq->id,
            'status' => 'closed',
        ]);

        $this->assertDatabaseHas('purchase_orders', [
            'vendor_id' => $this->vendor->id,
            'status' => 'draft',
            'total' => 100000,
        ]);
    }
}
