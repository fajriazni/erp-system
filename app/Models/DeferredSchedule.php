<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeferredSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'type', // revenue, expense
        'total_amount',
        'start_date',
        'end_date',
        'deferred_account_id', // Balance Sheet (Liability/Asset)
        'recognition_account_id', // P&L (Revenue/Expense)
        'status', // draft, active, finished, cancelled
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(DeferredScheduleItem::class);
    }

    public function deferredAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'deferred_account_id');
    }

    public function recognitionAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'recognition_account_id');
    }
}
