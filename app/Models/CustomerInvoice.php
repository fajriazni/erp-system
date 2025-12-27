<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'invoice_number',
        'reference_number',
        'date',
        'due_date',
        'status',
        'subtotal',
        'tax_amount',
        'total_amount',
        'notes',
        'journal_entry_id',
        'posted_at',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'posted_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Contact::class, 'customer_id');
    }

    public function lines()
    {
        return $this->hasMany(CustomerInvoiceLine::class);
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }
}
