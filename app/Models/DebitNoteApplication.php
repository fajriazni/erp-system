<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebitNoteApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'debit_note_id',
        'vendor_bill_id',
        'amount_applied',
        'application_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount_applied' => 'decimal:2',
        'application_date' => 'date',
    ];

    // Relationships
    public function debitNote(): BelongsTo
    {
        return $this->belongsTo(DebitNote::class);
    }

    public function vendorBill(): BelongsTo
    {
        return $this->belongsTo(VendorBill::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
