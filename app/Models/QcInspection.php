<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class QcInspection extends Model
{
    protected $fillable = [
        'reference_number',
        'inspectable_type',
        'inspectable_id',
        'inspector_id',
        'quantity_inspected',
        'passed_qty',
        'failed_qty',
        'status',
        'notes',
        'checklist_results',
    ];

    protected $casts = [
        'checklist_results' => 'array',
    ];

    public function inspectable(): MorphTo
    {
        return $this->morphTo();
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    /**
     * Get the total quantity inspected.
     */
    public function getTotalQtyAttribute(): int
    {
        return $this->passed_qty + $this->failed_qty;
    }

    /**
     * Get the pass rate as percentage.
     */
    public function getPassRateAttribute(): float
    {
        $total = $this->total_qty;
        if ($total <= 0) {
            return 0;
        }

        return round(($this->passed_qty / $total) * 100, 2);
    }
}
