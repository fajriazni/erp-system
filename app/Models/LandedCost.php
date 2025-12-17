<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LandedCost extends Model
{
    protected $fillable = [
        'goods_receipt_id',
        'cost_type',
        'description',
        'amount',
        'allocation_method',
        'expense_account_id',
        'reference_number',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function expenseAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'expense_account_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(LandedCostAllocation::class);
    }

    /**
     * Get available cost types.
     */
    public static function costTypes(): array
    {
        return [
            'freight' => 'Freight / Shipping',
            'insurance' => 'Insurance',
            'customs' => 'Customs / Import Duty',
            'handling' => 'Handling / Loading',
            'other' => 'Other',
        ];
    }

    /**
     * Get available allocation methods.
     */
    public static function allocationMethods(): array
    {
        return [
            'by_value' => 'By Value (proportional to item price)',
            'by_quantity' => 'By Quantity (equal per unit)',
            'by_weight' => 'By Weight (for items with weight)',
        ];
    }
}
