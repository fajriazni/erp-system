<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlanketOrder extends Model
{
    use HasFactory;
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

    public function vendor()
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
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

    public function workflowInstances()
    {
        return $this->morphMany(WorkflowInstance::class, 'entity');
    }

    public function latestWorkflow()
    {
        return $this->morphOne(WorkflowInstance::class, 'entity')->latestOfMany();
    }
}
