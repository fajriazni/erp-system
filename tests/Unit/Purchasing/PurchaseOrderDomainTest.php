<?php

namespace Tests\Unit\Purchasing;

use App\Domain\Purchasing\Exceptions\InvalidPurchaseOrderStateException;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderDomainTest extends TestCase
{
    use RefreshDatabase;

    private PurchaseOrder $purchaseOrder;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test data
        $vendor = Contact::factory()->create(['type' => 'vendor']);
        $warehouse = Warehouse::factory()->create();

        $this->purchaseOrder = PurchaseOrder::factory()->create([
            'vendor_id' => $vendor->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'draft',
        ]);

        // Add at least one item
        $product = Product::factory()->create();
        $this->purchaseOrder->items()->create([
            'product_id' => $product->id,
            'description' => $product->name,
            'quantity' => 10,
            'uom_id' => $product->uom_id,
            'unit_price' => 100,
            'subtotal' => 1000,
        ]);

        $this->purchaseOrder->load('items');
    }

    public function test_can_submit_draft_purchase_order(): void
    {
        $this->purchaseOrder->submit();

        $this->assertEquals('rfq_sent', $this->purchaseOrder->fresh()->status);
    }

    public function test_cannot_submit_non_draft_purchase_order(): void
    {
        $this->purchaseOrder->update(['status' => 'rfq_sent']);

        $this->expectException(InvalidPurchaseOrderStateException::class);
        $this->purchaseOrder->submit();
    }

    public function test_can_approve_purchase_order_pending_approval(): void
    {
        $this->purchaseOrder->update(['status' => 'to_approve']);

        $this->purchaseOrder->approve();

        $this->assertEquals('purchase_order', $this->purchaseOrder->fresh()->status);
    }

    public function test_cannot_approve_non_pending_purchase_order(): void
    {
        $this->expectException(InvalidPurchaseOrderStateException::class);
        $this->purchaseOrder->approve();
    }

    public function test_can_cancel_purchase_order(): void
    {
        $reason = 'Vendor not available';

        $this->purchaseOrder->cancel($reason);

        $this->purchaseOrder->refresh();
        $this->assertEquals('cancelled', $this->purchaseOrder->status);
        $this->assertEquals($reason, $this->purchaseOrder->cancellation_reason);
    }

    public function test_cannot_cancel_locked_purchase_order(): void
    {
        $this->purchaseOrder->update(['status' => 'locked']);

        $this->expectException(InvalidPurchaseOrderStateException::class);
        $this->purchaseOrder->cancel('Test reason');
    }

    public function test_can_lock_approved_purchase_order(): void
    {
        $this->purchaseOrder->update(['status' => 'purchase_order']);

        $this->purchaseOrder->lock();

        $this->assertEquals('locked', $this->purchaseOrder->fresh()->status);
    }

    public function test_recalculate_total(): void
    {
        $this->purchaseOrder->recalculateTotal();

        $this->assertEquals(1000, $this->purchaseOrder->fresh()->total);
    }

    public function test_can_be_edited_only_when_draft(): void
    {
        $this->assertTrue($this->purchaseOrder->canBeEdited());

        $this->purchaseOrder->update(['status' => 'rfq_sent']);
        $this->assertFalse($this->purchaseOrder->canBeEdited());
    }

    public function test_can_be_deleted_only_when_draft_or_cancelled(): void
    {
        $this->assertTrue($this->purchaseOrder->canBeDeleted());

        $this->purchaseOrder->update(['status' => 'cancelled']);
        $this->assertTrue($this->purchaseOrder->canBeDeleted());

        $this->purchaseOrder->update(['status' => 'purchase_order']);
        $this->assertFalse($this->purchaseOrder->canBeDeleted());
    }

    public function test_can_be_submitted_when_draft_with_items_and_vendor(): void
    {
        $this->assertTrue($this->purchaseOrder->canBeSubmitted());

        // Remove items
        $this->purchaseOrder->items()->delete();
        $this->purchaseOrder->load('items');
        $this->assertFalse($this->purchaseOrder->canBeSubmitted());
    }

    public function test_status_check_methods(): void
    {
        $this->assertTrue($this->purchaseOrder->isDraft());
        $this->assertFalse($this->purchaseOrder->isSubmitted());
        $this->assertFalse($this->purchaseOrder->isApproved());
        $this->assertFalse($this->purchaseOrder->isLocked());
        $this->assertFalse($this->purchaseOrder->isCancelled());

        $this->purchaseOrder->update(['status' => 'rfq_sent']);
        $this->assertFalse($this->purchaseOrder->isDraft());
        $this->assertTrue($this->purchaseOrder->isSubmitted());

        $this->purchaseOrder->update(['status' => 'purchase_order']);
        $this->assertTrue($this->purchaseOrder->isApproved());

        $this->purchaseOrder->update(['status' => 'locked']);
        $this->assertTrue($this->purchaseOrder->isLocked());

        $this->purchaseOrder->update(['status' => 'cancelled']);
        $this->assertTrue($this->purchaseOrder->isCancelled());
    }
}
