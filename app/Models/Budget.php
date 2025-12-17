<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'department_id',
        'account_id',
        'fiscal_year',
        'period_type',
        'period_number',
        'amount',
        'warning_threshold',
        'is_strict',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'warning_threshold' => 'decimal:2',
        'is_strict' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }

    public function encumbrances(): HasMany
    {
        return $this->hasMany(BudgetEncumbrance::class);
    }

    /**
     * Get total encumbered (committed) amount for this budget.
     */
    public function getEncumberedAmountAttribute(): float
    {
        return (float) $this->encumbrances()->where('status', 'active')->sum('amount');
    }

    /**
     * Get available budget (amount - encumbered).
     */
    public function getAvailableAmountAttribute(): float
    {
        return (float) $this->amount - $this->encumbered_amount;
    }

    /**
     * Get utilization percentage.
     */
    public function getUtilizationPercentAttribute(): float
    {
        if ($this->amount == 0) {
            return 0;
        }

        return ($this->encumbered_amount / $this->amount) * 100;
    }
}
