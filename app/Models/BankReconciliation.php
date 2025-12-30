<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankReconciliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_account_id',
        'statement_date',
        'start_date',
        'end_date',
        'statement_balance',
        'reconciled_balance',
        'status',
        'notes',
    ];

    protected $casts = [
        'statement_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'statement_balance' => 'decimal:2',
        'reconciled_balance' => 'decimal:2',
    ];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BankTransaction::class);
    }
}
