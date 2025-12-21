<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'claim_number',
        'purchase_order_id',
        'goods_receipt_id',
        'vendor_id',
        'claim_type',
        'claim_date',
        'claim_amount',
        'status',
        'description',
        'evidence_attachments',
        'vendor_response',
        'settlement_type',
        'settlement_amount',
        'settlement_date',
        'submitted_by',
        'reviewed_by',
        'approved_by',
        'settled_by',
    ];

    protected $casts = [
        'claim_date' => 'date',
        'settlement_date' => 'date',
        'claim_amount' => 'decimal:2',
        'settlement_amount' => 'decimal:2',
        'evidence_attachments' => 'array',
    ];

    // Relationships
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function settler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'settled_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->whereIn('status', ['submitted', 'under_review']);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    // Methods
    public function submit(): void
    {
        $this->update([
            'status' => 'submitted',
            'submitted_by' => auth()->id(),
        ]);
    }

    public function review(User $reviewer): void
    {
        $this->update([
            'status' => 'under_review',
            'reviewed_by' => $reviewer->id,
        ]);
    }

    public function approve(): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
        ]);
    }

    public function dispute(string $reason): void
    {
        $this->update([
            'status' => 'disputed',
            'vendor_response' => $reason,
        ]);
    }

    public function settle(string $type, float $amount): void
    {
        $this->update([
            'status' => 'settled',
            'settlement_type' => $type,
            'settlement_amount' => $amount,
            'settlement_date' => now(),
            'settled_by' => auth()->id(),
        ]);

        // If settlement is credit_note, create debit note
        if ($type === 'credit_note') {
            $this->createDebitNote($amount);
        }
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'vendor_response' => $reason,
        ]);
    }

    protected function createDebitNote(float $amount): void
    {
        DebitNote::create([
            'debit_note_number' => 'DN-CLAIM-'.$this->id,
            'vendor_id' => $this->vendor_id,
            'date' => now(),
            'total_amount' => $amount,
            'remaining_amount' => $amount,
            'reference_number' => $this->claim_number,
            'notes' => "Debit Note from Vendor Claim #{$this->claim_number}",
            'status' => 'unposted',
        ]);
    }
}
