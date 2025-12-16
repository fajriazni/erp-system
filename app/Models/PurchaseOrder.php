<?php

namespace App\Models;

use App\Domain\Purchasing\Events\PurchaseOrderApproved;
use App\Domain\Purchasing\Events\PurchaseOrderCancelled;
use App\Domain\Purchasing\Events\PurchaseOrderSubmitted;
use App\Domain\Purchasing\Exceptions\InvalidPurchaseOrderStateException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model implements \App\Domain\Workflow\Contracts\HasWorkflow
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'warehouse_id',
        'document_number',
        'date',
        'status',
        'total',
        'notes',
        'cancellation_reason',
        'purchase_request_id',
    ];

    protected $casts = [
        'date' => 'date',
        'total' => 'decimal:2',
    ];

    // Relationships
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function goodsReceipts(): HasMany
    {
        return $this->hasMany(GoodsReceipt::class);
    }

    public function vendorBills(): HasMany
    {
        return $this->hasMany(VendorBill::class);
    }

    public function workflowInstances()
    {
        return $this->morphMany(\App\Models\WorkflowInstance::class, 'entity');
    }

    public function activeWorkflowInstance()
    {
        return $this->morphOne(\App\Models\WorkflowInstance::class, 'entity')
            ->where('status', 'pending')
            ->latest();
    }

    // Domain methods
    public function submit(): void
    {
        if ($this->status !== 'draft') {
            throw InvalidPurchaseOrderStateException::cannotSubmit($this->status);
        }

        if ($this->items->isEmpty()) {
            throw new \InvalidArgumentException('Purchase order must have at least one item');
        }

        if (! $this->vendor_id) {
            throw new \InvalidArgumentException('Purchase order must have a vendor');
        }

        $this->status = 'rfq_sent';
        $this->save();

        event(new PurchaseOrderSubmitted($this));
    }

    public function approve(): void
    {
        if (!in_array($this->status, ['to_approve', 'rfq_sent'])) {
            throw InvalidPurchaseOrderStateException::cannotApprove($this->status);
        }

        $this->status = 'purchase_order';
        $this->save();

        event(new PurchaseOrderApproved($this));
    }

    public function markAsPendingApproval(): void
    {
        $this->status = 'to_approve';
        // We could validation here to ensure it came from draft/rfq_sent
        $this->save();
    }

    public function cancel(string $reason): void
    {
        if (in_array($this->status, ['locked', 'cancelled'])) {
            throw InvalidPurchaseOrderStateException::cannotCancel($this->status);
        }

        $this->status = 'cancelled';
        $this->cancellation_reason = $reason;
        $this->save();

        event(new PurchaseOrderCancelled($this, $reason));
    }

    public function lock(): void
    {
        if ($this->status !== 'purchase_order') {
            throw new InvalidPurchaseOrderStateException("Cannot lock purchase order with status: {$this->status}");
        }

        $this->status = 'locked';
        $this->save();
    }

    public function recalculateTotal(): void
    {
        $this->total = $this->items->sum('subtotal');
        $this->save();
    }

    public function canBeEdited(): bool
    {
        return $this->status === 'draft';
    }

    public function canBeDeleted(): bool
    {
        return in_array($this->status, ['draft', 'cancelled']);
    }

    public function canBeSubmitted(): bool
    {
        return $this->status === 'draft'
            && $this->items->isNotEmpty()
            && $this->vendor_id !== null;
    }

    public function canBeApproved(): bool
    {
        return in_array($this->status, ['to_approve', 'rfq_sent']);
    }

    public function canBeCancelled(): bool
    {
        return ! in_array($this->status, ['locked', 'cancelled']);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'rfq_sent';
    }

    public function isApproved(): bool
    {
        return $this->status === 'purchase_order';
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    // HasWorkflow implementation
    public function onWorkflowApproved(): void
    {
        // Automatically approve the PO when workflow is complete
        $this->approve();
    }

    public function onWorkflowRejected(string $reason): void
    {
        // Revert to draft so it can be edited and resubmitted
        $this->status = 'draft';
        // Optionally append reason to notes or keep separate
        // For now just revert status
        $this->save();
    }
}
