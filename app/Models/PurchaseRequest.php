<?php

namespace App\Models;

use App\Domain\Workflow\Contracts\HasWorkflow;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseRequest extends Model implements HasWorkflow
{
    use \App\Domain\Workflow\Traits\InteractsWithWorkflow, HasFactory, SoftDeletes;

    protected $fillable = [
        'document_number',
        'requester_id',
        'department_id',
        'date',
        'required_date',
        'status',
        'notes',
        'rejection_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'required_date' => 'date',
    ];

    // Relationships
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    // public function department(): BelongsTo { ... } // If Department model exists

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseRequestItem::class);
    }

    public function getTotalAmountAttribute(): float
    {
        return $this->items->sum('estimated_total');
    }

    // Domain Methods
    public function submit(): void
    {
        if ($this->status !== 'draft') {
            throw new \Exception('Only draft requests can be submitted.');
        }
        $this->status = 'submitted';
        $this->save();
    }

    public function approve(): void
    {
        $this->status = 'approved';
        $this->save();
    }

    public function markAsPendingApproval(): void
    {
        $this->status = 'submitted'; // or 'approve_pending' if we want distinction
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
