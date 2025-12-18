<?php

namespace App\Domain\Assets\Models;

use App\Models\JournalEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepreciationEntry extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'book_value_after' => 'decimal:2',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class, 'gl_entry_id');
    }
}
