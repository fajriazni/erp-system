<?php

namespace App\Models;

use App\Domain\Workflow\Contracts\HasWorkflow;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property \Illuminate\Support\Carbon|null $deadline
 */
class PurchaseRfq extends Model implements HasWorkflow
{
    use \App\Domain\Workflow\Traits\InteractsWithWorkflow, HasFactory, SoftDeletes;

    protected $fillable = [
        'document_number',
        'purchase_request_id',
        'title',
        'deadline',
        'status',
        'user_id',
        'created_by',
        'notes',
        'rejection_reason',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lines()
    {
        return $this->hasMany(PurchaseRfqLine::class);
    }

    public function vendors()
    {
        return $this->belongsToMany(Contact::class, 'rfq_vendors', 'purchase_rfq_id', 'vendor_id')
            ->withTimestamps();
    }

    // Legacy support if needed, or alias
    public function invitedVendors()
    {
        return $this->vendors();
    }

    public function quotations()
    {
        return $this->hasMany(VendorQuotation::class);
    }

    // Domain Methods
    public function approve(): void
    {
        $this->status = 'approved';
        $this->save();
    }

    public function reject(string $reason): void
    {
        $this->status = 'rejected';
        $this->rejection_reason = $reason;
        $this->save();
    }

    // HasWorkflow Implementation
    public function onWorkflowApproved(): void
    {
        $this->approve();
    }

    public function onWorkflowRejected(string $reason): void
    {
        $this->reject($reason);
    }
}
