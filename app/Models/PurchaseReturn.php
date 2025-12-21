<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PurchaseReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'return_number',
        'goods_receipt_id',
        'purchase_order_id',
        'vendor_id',
        'warehouse_id',
        'rma_number',
        'return_date',
        'status',
        'reason',
        'total_amount',
        'notes',
        'shipped_date',
        'received_by_vendor_date',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'return_date' => 'date',
        'shipped_date' => 'datetime',
        'received_by_vendor_date' => 'datetime',
        'cancelled_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    // Relationships
    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseReturnItem::class);
    }

    public function debitNote(): HasOne
    {
        return $this->hasOne(DebitNote::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function canceller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'pending_authorization']);
    }

    public function scopeShipped($query)
    {
        return $query->where('status', 'shipped');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Methods
    public function authorize(string $rmaNumber): void
    {
        $this->update([
            'rma_number' => $rmaNumber,
            'status' => 'ready_to_ship',
        ]);
    }

    public function ship(): void
    {
        $this->update([
            'status' => 'shipped',
            'shipped_date' => now(),
        ]);

        // Decrease inventory when shipped
        foreach ($this->items as $item) {
            $this->decreaseInventory($item);
        }
    }

    public function receiveByVendor(): void
    {
        $this->update([
            'status' => 'received_by_vendor',
            'received_by_vendor_date' => now(),
        ]);
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function cancel(string $reason): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => auth()->id(),
            'cancellation_reason' => $reason,
        ]);

        // Reverse inventory if already shipped
        if ($this->shipped_date) {
            foreach ($this->items as $item) {
                $this->reverseInventory($item);
            }
        }
    }

    protected function decreaseInventory(PurchaseReturnItem $item): void
    {
        $stock = \DB::table('product_warehouse')
            ->where('product_id', $item->product_id)
            ->where('warehouse_id', $this->warehouse_id)
            ->first();

        if ($stock) {
            \DB::table('product_warehouse')
                ->where('product_id', $item->product_id)
                ->where('warehouse_id', $this->warehouse_id)
                ->update([
                    'quantity' => \DB::raw("quantity - {$item->quantity}"),
                    'updated_at' => now(),
                ]);
        }
    }

    protected function reverseInventory(PurchaseReturnItem $item): void
    {
        \DB::table('product_warehouse')
            ->where('product_id', $item->product_id)
            ->where('warehouse_id', $this->warehouse_id)
            ->update([
                'quantity' => \DB::raw("quantity + {$item->quantity}"),
                'updated_at' => now(),
            ]);
    }

    // Computed attributes
    public function getTotalAmountAttribute($value)
    {
        return $value ?? $this->items->sum('subtotal');
    }
}
