<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThreeWayMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'goods_receipt_id',
        'vendor_bill_id',
        'status',
        'qty_variance',
        'price_variance',
        'amount_variance',
        'variance_percentage',
        'discrepancies',
        'matched_at',
        'matched_by',
        'approved_by',
        'approved_at',
        'approval_notes',
        'notes',
    ];

    protected $casts = [
        'qty_variance' => 'decimal:2',
        'price_variance' => 'decimal:2',
        'amount_variance' => 'decimal:2',
        'variance_percentage' => 'decimal:2',
        'discrepancies' => 'array',
        'matched_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function vendorBill(): BelongsTo
    {
        return $this->belongsTo(VendorBill::class);
    }

    public function matchedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'matched_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Status Checkers
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isMatched(): bool
    {
        return $this->status === 'matched';
    }

    public function isPartialMatch(): bool
    {
        return $this->status === 'partial_match';
    }

    public function isMismatch(): bool
    {
        return $this->status === 'mismatch';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function needsApproval(): bool
    {
        return in_array($this->status, ['partial_match', 'mismatch']);
    }

    // Domain Methods
    public function approve(User $user, ?string $notes = null): void
    {
        if (!$this->needsApproval()) {
            throw new \Exception("Only partial_match or mismatch can be approved. Current status: {$this->status}");
        }

        $this->status = 'approved';
        $this->approved_by = $user->id;
        $this->approved_at = now();
        $this->approval_notes = $notes;
        $this->save();
    }
}
