<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseAgreement extends Model
{
    use HasFactory;
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

    public function workflowInstances()
    {
        return $this->morphMany(WorkflowInstance::class, 'entity');
    }

    public function latestWorkflow()
    {
        return $this->morphOne(WorkflowInstance::class, 'entity')->latestOfMany();
    }
}
