<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'customer_id',
        'date',
        'amount',
        'reference',
        'payment_method',
        'notes',
        'status',
        'journal_entry_id',
        'posted_at',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'posted_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Contact::class, 'customer_id');
    }

    public function lines()
    {
        return $this->hasMany(CustomerPaymentLine::class);
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }
}
