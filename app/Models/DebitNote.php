<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DebitNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'debit_note_number',
        'purchase_return_id',
        'vendor_id',
        'date',
        'due_date',
        'status',
        'total_amount',
        'applied_amount',
        'remaining_amount',
        'reference_number',
        'notes',
        'posted_at',
        'posted_by',
        'voided_at',
        'voided_by',
        'void_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'applied_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'posted_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    // Relationships
    public function purchaseReturn(): BelongsTo
    {
        return $this->belongsTo(PurchaseReturn::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(DebitNoteApplication::class);
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function voider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'posted')
            ->where('remaining_amount', '>', 0);
    }

    public function scopePosted($query)
    {
        return $query->where('status', 'posted');
    }

    // Methods
    public function post(): void
    {
        $this->update([
            'status' => 'posted',
            'posted_at' => now(),
            'posted_by' => auth()->id(),
            'remaining_amount' => $this->total_amount,
        ]);

        // Create journal entry (reduce AP)
        $this->createJournalEntry();
    }

    public function applyToInvoice(VendorBill $bill, float $amount): void
    {
        if ($amount > $this->remaining_amount) {
            throw new \Exception('Amount exceeds remaining balance');
        }

        // Create application record
        $this->applications()->create([
            'vendor_bill_id' => $bill->id,
            'amount_applied' => $amount,
            'application_date' => now(),
            'created_by' => auth()->id(),
        ]);

        // Update amounts
        $this->increment('applied_amount', $amount);
        $this->decrement('remaining_amount', $amount);

        // Update status
        if ($this->remaining_amount <= 0) {
            $this->update(['status' => 'applied']);
        } elseif ($this->applied_amount > 0) {
            $this->update(['status' => 'partially_applied']);
        }

        // Reduce vendor bill amount
        $bill->decrement('total_amount', $amount);
    }

    public function void(string $reason): void
    {
        $this->update([
            'status' => 'voided',
            'voided_at' => now(),
            'voided_by' => auth()->id(),
            'void_reason' => $reason,
        ]);

        // Reverse journal entry
        $this->reverseJournalEntry();
    }

    protected function createJournalEntry(): void
    {
        // Debit: AP (reduce liability)
        // Credit: Clearing Account
        $journalEntry = JournalEntry::create([
            'reference_number' => $this->debit_note_number,
            'description' => "Debit Note #{$this->debit_note_number} - {$this->vendor->name}",
            'date' => $this->date,
            'posted_at' => now(),
        ]);

        // AP Debit
        $journalEntry->lines()->create([
            'chart_of_account_id' => ChartOfAccount::where('code', '2100')->first()->id,
            'debit' => $this->total_amount,
            'credit' => 0,
            'description' => 'Reduce Account Payable',
        ]);

        // Clearing Credit
        $journalEntry->lines()->create([
            'chart_of_account_id' => ChartOfAccount::where('code', '2110')->first()->id,
            'debit' => 0,
            'credit' => $this->total_amount,
            'description' => 'Clearing Account',
        ]);
    }

    protected function reverseJournalEntry(): void
    {
        // Find and reverse the journal entry
        $journalEntry = JournalEntry::where('reference_number', $this->debit_note_number)->first();
        if ($journalEntry) {
            $journalEntry->delete();
        }
    }

    // Computed
    public function getRemainingAmountAttribute($value)
    {
        return $value ?? ($this->total_amount - $this->applied_amount);
    }
}
