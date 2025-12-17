<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'date',
        'description',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function lines()
    {
        return $this->hasMany(JournalEntryLine::class);
    }
}
