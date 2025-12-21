<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlanketOrder extends Model implements \App\Domain\Workflow\Contracts\HasWorkflow
{
    use \App\Domain\Workflow\Traits\InteractsWithWorkflow, HasFactory;

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

    public const STATUS_PENDING_APPROVAL = 'pending_approval';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_OPEN = 'open'; // Active / Running

    public const STATUS_PARTIALLY_ORDERED = 'partially_ordered'; // Was partially_delivered

    public const STATUS_FULFILLED = 'fulfilled'; // Was fully_delivered, effectively closed

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
        if ($this->status !== self::STATUS_DRAFT && $this->status !== self::STATUS_REJECTED) {
            throw new \Exception('Only draft or rejected BPOs can be submitted.');
        }
        $this->update(['status' => self::STATUS_PENDING_APPROVAL]);
    }

    public function approve(): void
    {
        if ($this->status !== self::STATUS_PENDING_APPROVAL) {
            throw new \Exception('Only pending BPOs can be approved.');
        }
        $this->update(['status' => self::STATUS_OPEN]);
    }

    public function reject(): void
    {
        if ($this->status !== self::STATUS_PENDING_APPROVAL) {
            throw new \Exception('Only pending BPOs can be rejected.');
        }
        $this->update(['status' => self::STATUS_REJECTED]);
    }

    public function activate(): void
    {
        if (! in_array($this->status, [self::STATUS_DRAFT, self::STATUS_REJECTED])) {
            throw new \Exception('Only draft BPOs can be activated.');
        }
        $this->update(['status' => self::STATUS_OPEN]);
    }

    // ...

    public function updateRealizationStatus(): void
    {
        // Only update if currently in a "running" state
        if (! in_array($this->status, [self::STATUS_OPEN, self::STATUS_PARTIALLY_ORDERED])) {
            return;
        }

        $amountUsed = $this->amountUsed();
        $limit = $this->amount_limit;

        // Check Fulfilled (Value limit reached)
        if ($amountUsed >= $limit) {
            $this->update(['status' => self::STATUS_FULFILLED]);

            return;
        }

        // Check Fulfilled (Quantity limit reached)
        $allLinesFulfilled = true;
        if ($this->lines()->exists()) {
            foreach ($this->lines as $line) {
                if ($line->quantity_agreed && $line->quantity_ordered < $line->quantity_agreed) {
                    $allLinesFulfilled = false;
                    break;
                }
            }
        } else {
            $allLinesFulfilled = false;
        }

        if ($allLinesFulfilled) {
            $this->update(['status' => self::STATUS_FULFILLED]);

            return;
        }

        // Check Partially Ordered
        if ($amountUsed > 0) {
            $this->update(['status' => self::STATUS_PARTIALLY_ORDERED]);

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
