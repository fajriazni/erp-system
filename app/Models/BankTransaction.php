<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_account_id',
        'type', // deposit, withdrawal, transfer_in, transfer_out
        'amount',
        'reference',
        'description',
        'status', // pending, posted, void
        'transaction_date',
        'posted_at',
        'bank_reconciliation_id',
        'is_reconciled',
        'reconciled_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
        'posted_at' => 'datetime',
        'is_reconciled' => 'boolean',
        'reconciled_at' => 'datetime',
    ];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function bankReconciliation(): BelongsTo
    {
        return $this->belongsTo(BankReconciliation::class);
    }

    public function scopeUnreconciled($query)
    {
        return $query->where('is_reconciled', false);
    }
}
