<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankAccount extends Model
{
    use HasFactory;

    const TYPE_BANK = 'bank';
    const TYPE_CASH = 'cash';
    const TYPE_CREDIT_CARD = 'credit_card';
    const TYPE_EWALLET = 'ewallet';

    protected $fillable = [
        'name',
        'bank_name',
        'account_number',
        'currency',
        'opening_balance',
        'current_balance',
        'chart_of_account_id',
        'is_active',
        'description',
        'type',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function scopeBank($query)
    {
        return $query->where('type', self::TYPE_BANK);
    }

    public function scopeCash($query)
    {
        return $query->where('type', self::TYPE_CASH);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BankTransaction::class);
    }

    public function chartOfAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class);
    }
}
