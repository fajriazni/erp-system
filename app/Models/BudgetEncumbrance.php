<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class BudgetEncumbrance extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'encumberable_type',
        'encumberable_id',
        'amount',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Get the encumberable entity (PR or PO).
     */
    public function encumberable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Release this encumbrance (mark as released).
     */
    public function release(): void
    {
        $this->update(['status' => 'released']);
    }

    /**
     * Cancel this encumbrance.
     */
    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }
}
