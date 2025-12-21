<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseAgreement extends Model implements \App\Domain\Workflow\Contracts\HasWorkflow
{
    use HasFactory, \App\Domain\Workflow\Traits\InteractsWithWorkflow;

    protected $fillable = [
        'vendor_id',
        'reference_number',
        'title',
        'start_date',
        'end_date',
        'status',
        'document_path',
        'total_value_cap',
        'renewal_reminder_days',
        'is_auto_renew',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_value_cap' => 'decimal:2',
        'is_auto_renew' => 'boolean',
    ];

    public function vendor()
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function blanketOrders()
    {
        return $this->hasMany(BlanketOrder::class);
    }

    // Domain Methods

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING_APPROVAL = 'pending_approval';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_FULFILLED = 'fulfilled';
    public const STATUS_ON_HOLD = 'on_hold';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_CLOSED = 'closed'; // Keeping backward compatibility if needed, or map to fulfilled/expired

    public function submit(): void
    {
        if ($this->status !== self::STATUS_DRAFT) {
            throw \App\Domain\Purchasing\Exceptions\InvalidPurchaseAgreementStateException::cannotSubmit($this->status);
        }

        $this->status = self::STATUS_PENDING_APPROVAL;
        $this->save();

        event(new \App\Domain\Purchasing\Events\PurchaseAgreementSubmitted($this));
    }

    public function markAsPendingApproval(): void
    {
        $this->update(['status' => self::STATUS_PENDING_APPROVAL]);
    }

    public function approve(): void
    {
        if (! in_array($this->status, [self::STATUS_PENDING_APPROVAL, 'submitted'])) {
            throw \App\Domain\Purchasing\Exceptions\InvalidPurchaseAgreementStateException::cannotApprove($this->status);
        }

        $this->status = self::STATUS_ACTIVE;
        $this->save();

        event(new \App\Domain\Purchasing\Events\PurchaseAgreementApproved($this));
    }

    public function reject(): void
    {
         if (! in_array($this->status, [self::STATUS_PENDING_APPROVAL, 'submitted'])) {
             // throw exception? For now just allow if in pending state
         }
         
         $this->status = self::STATUS_DRAFT; // Reset to draft on reject? Or 'rejected' status? 
         // Usually Draft to allow edit and resubmit.
         $this->save();
    }

    public function hold(): void
    {
        if ($this->status !== self::STATUS_ACTIVE) {
             throw new \Exception("Only active agreements can be put on hold.");
        }
        $this->update(['status' => self::STATUS_ON_HOLD]);
    }

    public function resume(): void
    {
        if ($this->status !== self::STATUS_ON_HOLD) {
             throw new \Exception("Only on-hold agreements can be resumed.");
        }
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    public function cancel(): void
    {
        if (in_array($this->status, [self::STATUS_CANCELLED, self::STATUS_EXPIRED])) {
             throw new \Exception("Agreement is already cancelled or expired.");
        }
        $this->update(['status' => self::STATUS_CANCELLED]);
    }
    
    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function canBeDeleted(): bool
    {
        return $this->status === self::STATUS_DRAFT;
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
