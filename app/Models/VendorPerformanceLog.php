<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VendorPerformanceLog extends Model
{
    protected $fillable = [
        'vendor_id',
        'metric_type',
        'reference_type',
        'reference_id',
        'value',
        'description',
        'period_date',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'period_date' => 'date',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Metric types.
     */
    public const METRIC_DELIVERY = 'delivery';

    public const METRIC_QUALITY = 'quality';

    public const METRIC_RETURN = 'return';
}
