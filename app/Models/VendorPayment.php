<?php

namespace App\Models;

use App\Domain\Workflow\Contracts\HasWorkflow;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorPayment extends Model implements HasWorkflow
{
    use \App\Domain\Workflow\Traits\InteractsWithWorkflow, HasFactory;

    protected $fillable = [
        'payment_number',
        'vendor_id',
        'date',
        'amount',
        'reference',
        'payment_method',
        'notes',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(VendorPaymentLine::class);
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
