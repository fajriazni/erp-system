<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeferredScheduleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'deferred_schedule_id',
        'date',
        'amount',
        'journal_entry_id',
        'is_processed',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'is_processed' => 'boolean',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(DeferredSchedule::class, 'deferred_schedule_id');
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }
}
