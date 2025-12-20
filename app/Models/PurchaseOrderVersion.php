<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderVersion extends Model
{
    // Enable timestamps but disable updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'purchase_order_id',
        'version_number',
        'change_type',
        'change_summary',
        'snapshot',
        'changes',
        'created_by',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'changes' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Helper method to restore this version
    public function restore(): PurchaseOrder
    {
        $po = $this->purchaseOrder;
        $snapshot = $this->snapshot;

        // Restore header fields
        $po->update([
            'vendor_id' => $snapshot['header']['vendor_id'],
            'warehouse_id' => $snapshot['header']['warehouse_id'],
            'date' => $snapshot['header']['date'],
            'status' => $snapshot['header']['status'],
            'notes' => $snapshot['header']['notes'] ?? null,
            'subtotal' => $snapshot['header']['subtotal'] ?? 0,
            'tax_amount' => $snapshot['header']['tax_amount'] ?? 0,
            'total' => $snapshot['header']['total'],
        ]);

        // Restore items - delete all and recreate
        $po->items()->delete();
        foreach ($snapshot['items'] as $itemData) {
            $po->items()->create([
                'product_id' => $itemData['product_id'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'subtotal' => $itemData['subtotal'],
                'uom_id' => $itemData['uom_id'] ?? null,
                'description' => $itemData['description'] ?? null,
            ]);
        }

        // Refresh to get updated data
        $po->refresh();

        return $po;
    }
}
