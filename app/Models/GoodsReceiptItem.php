<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'goods_receipt_id',
        'product_id',
        'uom_id',
        'quantity_received',
        'notes',
        'qc_status',
        'qc_passed_qty',
        'qc_failed_qty',
        'qc_notes',
        'qc_by',
        'qc_at',
    ];

    protected $casts = [
        'quantity_received' => 'decimal:2',
    ];

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(Uom::class);
    }

    public function inspections()
    {
        return $this->morphMany(QcInspection::class, 'inspectable');
    }

    public function qcBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'qc_by');
    }

    // QC Workflow Methods
    public function startQc(): void
    {
        if ($this->qc_status !== 'pending') {
            throw new \Exception("Only pending items can start QC. Current status: {$this->qc_status}");
        }

        $this->qc_status = 'in_qa';
        $this->save();
    }

    public function recordQc(int $passedQty, int $failedQty, \App\Models\User $user, ?string $notes = null): void
    {
        if ($this->qc_status === 'pending') {
            $this->qc_status = 'in_qa';
        }

        $this->qc_passed_qty = $passedQty;
        $this->qc_failed_qty = $failedQty;
        $this->qc_notes = $notes;
        $this->qc_by = $user->id;
        $this->qc_at = now();

        // Determine final status
        $totalInspected = $passedQty + $failedQty;
        if ($totalInspected >= $this->quantity_received) {
            if ($failedQty === 0) {
                $this->qc_status = 'passed';
            } elseif ($passedQty === 0) {
                $this->qc_status = 'failed';
            } else {
                $this->qc_status = 'partial';
            }
        }

        $this->save();

        event(new \App\Domain\Purchasing\Events\QualityInspectionCompleted($this, $passedQty, $failedQty, $notes));
    }

    // Status Checkers
    public function isPendingQc(): bool
    {
        return $this->qc_status === 'pending';
    }

    public function isInQa(): bool
    {
        return $this->qc_status === 'in_qa';
    }

    public function isPassed(): bool
    {
        return $this->qc_status === 'passed';
    }

    public function isFailed(): bool
    {
        return $this->qc_status === 'failed';
    }

    public function isPartial(): bool
    {
        return $this->qc_status === 'partial';
    }

    // Computed Attributes
    public function getQcRemainingQtyAttribute(): float
    {
        return max(0, $this->quantity_received - ($this->qc_passed_qty + $this->qc_failed_qty));
    }

    public function getQcPassRateAttribute(): float
    {
        $total = $this->qc_passed_qty + $this->qc_failed_qty;

        return $total > 0 ? ($this->qc_passed_qty / $total) * 100 : 0;
    }
}
