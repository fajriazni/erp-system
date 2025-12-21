<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'warehouse_id',
        'receipt_number',
        'date',
        'status',
        'notes',
        'received_by',
        'received_at',
        'delivery_note_number',
        'physical_condition',
        'posted_at',
        'posted_by',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'received_at' => 'datetime',
        'posted_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(GoodsReceiptItem::class);
    }

    public function landedCosts(): HasMany
    {
        return $this->hasMany(LandedCost::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function threeWayMatches(): HasMany
    {
        return $this->hasMany(ThreeWayMatch::class);
    }

    // Domain Methods
    public function confirm(\App\Models\User $user): void
    {
        if ($this->status !== 'draft') {
            throw new \Exception("Only draft receipts can be posted. Current status: {$this->status}");
        }

        $oldStatus = $this->status;
        $this->status = 'posted';
        $this->posted_at = now();
        $this->posted_by = $user->id;
        $this->save();

        // Update PO received quantities
        $this->updatePurchaseOrderQuantities();

        event(new \App\Domain\Purchasing\Events\GoodsReceiptStatusChanged($this, $oldStatus, 'posted'));
    }

    public function cancel(\App\Models\User $user, string $reason): void
    {
        if ($this->status === 'cancelled') {
            throw new \Exception('Receipt is already cancelled.');
        }

        if ($this->status === 'posted') {
            throw new \Exception('Cannot cancel posted receipts. Please create a purchase return instead.');
        }

        $this->status = 'cancelled';
        $this->cancelled_at = now();
        $this->cancelled_by = $user->id;
        $this->cancellation_reason = $reason;
        $this->save();

        event(new \App\Domain\Purchasing\Events\GoodsReceiptCancelled($this, $reason));
    }

    protected function updatePurchaseOrderQuantities(): void
    {
        $po = $this->purchaseOrder;
        if (! $po) {
            return;
        }

        // Update quantity_received for each PO item based on this GR
        foreach ($this->items as $grItem) {
            $poItem = $po->items()->where('product_id', $grItem->product_id)->first();
            if ($poItem) {
                // Sum all posted receipts for this item
                $totalReceived = GoodsReceiptItem::whereHas('goodsReceipt', function ($query) use ($po) {
                    $query->where('purchase_order_id', $po->id)
                        ->where('status', 'posted');
                })->where('product_id', $grItem->product_id)
                    ->sum('quantity_received');

                $poItem->quantity_received = $totalReceived;
                $poItem->save();
            }
        }

        // Reload items to get fresh quantity_received values
        $po->load('items');

        // Update PO status
        $allFullyReceived = $po->items->every(function ($item) {
            return $item->quantity_received >= $item->quantity;
        });

        if ($allFullyReceived) {
            $po->status = 'fully_received';
        } else {
            $anyReceived = $po->items->some(function ($item) {
                return $item->quantity_received > 0;
            });
            if ($anyReceived) {
                $po->status = 'partial_received';
            }
        }

        $po->save();
    }

    // Status Checkers
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPosted(): bool
    {
        return $this->status === 'posted';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canBeEdited(): bool
    {
        return $this->status === 'draft';
    }

    public function canBePosted(): bool
    {
        return $this->status === 'draft' && $this->items()->count() > 0;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['draft']);
    }

    // Computed Attributes
    public function getTotalReceivedQuantityAttribute(): float
    {
        return (float) $this->items()->sum('quantity_received');
    }
}
