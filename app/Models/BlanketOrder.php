<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlanketOrder extends Model implements \App\Domain\Workflow\Contracts\HasWorkflow
{
    use HasFactory, \App\Domain\Workflow\Traits\InteractsWithWorkflow;

    protected $fillable = [
        'vendor_id',
        'purchase_agreement_id',
        'number',
        'start_date',
        'end_date',
        'amount_limit',
        'status',
        'renewal_reminder_days',
        'is_auto_renew',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount_limit' => 'decimal:2',
        'is_auto_renew' => 'boolean',
    ];

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING_APPROVAL = 'pending_approval'; // New status
    // public const STATUS_SENT = 'sent'; // Deprecated/Reserved for manual send? Keeping for now to avoid break if DB has it, but workflow uses pending_approval.
    public const STATUS_OPEN = 'open';
    public const STATUS_PARTIALLY_DELIVERED = 'partially_delivered';
    public const STATUS_FULLY_DELIVERED = 'fully_delivered';
    public const STATUS_DEPLETED = 'depleted';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_CANCELLED = 'cancelled';

    public function vendor()
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    // ... relations ...

    public function submit(): void
    {
        if ($this->status !== self::STATUS_DRAFT) {
             throw new \Exception("Only draft BPOs can be submitted.");
        }
        $this->update(['status' => self::STATUS_PENDING_APPROVAL]);
    }

    public function approve(): void
    {
         if ($this->status !== self::STATUS_PENDING_APPROVAL) {
             // Allow approving from 'sent' if we keep it? 
             // For workflow, strict check.
             throw new \Exception("Only pending BPOs can be approved.");
         }
         $this->update(['status' => self::STATUS_OPEN]);
    }

    public function reject(): void
    {
         if ($this->status !== self::STATUS_PENDING_APPROVAL) {
             throw new \Exception("Only pending BPOs can be rejected.");
         }
         $this->update(['status' => self::STATUS_DRAFT]);
    }

    public function activate(): void
    {
        // Manual activation (bypass workflow or legacy)
        if (!in_array($this->status, [self::STATUS_DRAFT, 'sent'])) {
            throw new \Exception("Only draft or sent BPOs can be activated.");
        }
        $this->update(['status' => self::STATUS_OPEN]);
    }

    public function markAsPendingApproval(): void
    {
        $this->update(['status' => self::STATUS_PENDING_APPROVAL]);
    }

    public function close(): void
    {
        if (in_array($this->status, [self::STATUS_CLOSED, self::STATUS_CANCELLED, self::STATUS_EXPIRED])) {
             throw new \Exception("BPO is already closed or invalid.");
        }
        $this->update(['status' => self::STATUS_CLOSED]);
    }

    public function cancel(): void
    {
        if (in_array($this->status, [self::STATUS_CLOSED, self::STATUS_CANCELLED, self::STATUS_EXPIRED])) {
             throw new \Exception("BPO is already closed or invalid.");
        }
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    public function updateRealizationStatus(): void
    {
         // Only update if currently in a "running" state
         if (!in_array($this->status, [self::STATUS_OPEN, self::STATUS_PARTIALLY_DELIVERED, self::STATUS_FULLY_DELIVERED, self::STATUS_DEPLETED])) {
            return;
         }

         $amountUsed = $this->amountUsed();
         $limit = $this->amount_limit;
         
         // Check Depleted (money)
         if ($amountUsed >= $limit) {
             $this->update(['status' => self::STATUS_DEPLETED]);
             return;
         }

         // Check Fully Delivered (quantity) - This is more complex if mixed items. 
         // Strategy: If ALL lines have met their agreed quantity.
         $allLinesFulfilled = true;
         if ($this->lines()->exists()) {
             foreach ($this->lines as $line) {
                 if ($line->quantity_agreed && $line->quantity_ordered < $line->quantity_agreed) {
                     $allLinesFulfilled = false;
                     break;
                 }
             }
         } else {
             // No lines defined? rely on amount.
             $allLinesFulfilled = false;
         }

         if ($allLinesFulfilled) {
             $this->update(['status' => self::STATUS_FULLY_DELIVERED]);
             return;
         }

         // Check Partially Delivered
         if ($amountUsed > 0) {
             $this->update(['status' => self::STATUS_PARTIALLY_DELIVERED]);
             return;
         }

         // Fallback to Open if no usage
         $this->update(['status' => self::STATUS_OPEN]);
    }


    public function agreement()
    {
        return $this->belongsTo(PurchaseAgreement::class, 'purchase_agreement_id');
    }

    public function lines()
    {
        return $this->hasMany(BlanketOrderLine::class);
    }

    public function releases()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    // InteractsWithWorkflow trait handles workflowInstances and latestWorkflow methods

    public function amountUsed(): float
    {
        // Calculate total from non-cancelled releases
        return $this->releases()
            ->whereNotIn('status', ['cancelled']) // Only count committed orders (Approvals/Locked) ?? 
            ->where('status', '!=', 'cancelled')
            ->sum('total');
    }

    public function remainingAmount(): float
    {
        return $this->amount_limit - $this->amountUsed();
    }

    public function remainingQuantity(int $productId): float
    {
        $line = $this->lines()->where('product_id', $productId)->first();

        if (! $line || is_null($line->quantity_agreed)) {
            return PHP_FLOAT_MAX; // No limit
        }

        return $line->quantity_agreed - $line->quantity_ordered;
    }

    // HasWorkflow Implementation

    public function onWorkflowApproved(): void
    {
        $this->approve();
    }

    public function onWorkflowRejected(string $reason): void
    {
        $this->reject();
    }
}
