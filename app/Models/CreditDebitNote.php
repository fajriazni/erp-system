<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditDebitNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'reference_number',
        'date',
        'reference_type',
        'reference_id',
        'contact_id',
        'amount',
        'subtotal',
        'tax_amount',
        'reason',
        'remaining_amount',
        'status',
        'journal_entry_id',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Contact::class);
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    /**
     * Get the reference model (polymorphic-like)
     */
    public function getReference()
    {
        if ($this->reference_type === 'invoice') {
            return \App\Models\CustomerInvoice::find($this->reference_id);
        } elseif ($this->reference_type === 'bill') {
            return \App\Models\VendorBill::find($this->reference_id);
        }

        return null;
    }

    /**
     * Generate next reference number
     */
    public static function generateReferenceNumber(string $type, string $entityType = 'customer'): string
    {
        // Generate prefix based on type and entity
        // Customer Credit: CCN, Customer Debit: CDN
        // Vendor Credit: VCN, Vendor Debit: VDN
        $entityPrefix = $entityType === 'customer' ? 'C' : 'V';
        $typePrefix = $type === 'credit' ? 'CN' : 'DN';
        $prefix = $entityPrefix.$typePrefix;

        $year = date('Y');
        $month = date('m');

        $lastNote = self::where('type', $type)
            ->where('entity_type', $entityType)
            ->where('reference_number', 'like', "{$prefix}-{$year}{$month}-%")
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastNote) {
            $lastNumber = (int) substr($lastNote->reference_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}-{$year}{$month}-{$newNumber}";
    }
}
