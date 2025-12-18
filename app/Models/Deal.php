<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'amount',
        'stage',
        'close_date',
        'contact_id',
        'lead_id',
        'owner_id',
        'probability',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'close_date' => 'date',
        'probability' => 'integer',
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
