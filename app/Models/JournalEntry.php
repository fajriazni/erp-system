<?php

namespace App\Models;

use App\Domain\Finance\Events\JournalEntryPosted;
use App\Domain\Finance\Events\JournalEntryReversed;
use App\Domain\Finance\ValueObjects\Money;
use DomainException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use InvalidArgumentException;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'date',
        'description',
        'status',
        'currency_code',
        'exchange_rate',
        'reversed_entry_id',
    ];

    protected $casts = [
        'date' => 'datetime',
        'exchange_rate' => 'decimal:6',
    ];

    protected static function boot()
    {
        parent::boot();

        // Prevent creating/updating journal entries in locked periods
        static::saving(function ($journalEntry) {
            if (! $journalEntry->date) {
                return; // Skip if date is not set yet
            }

            $period = AccountingPeriod::forDate($journalEntry->date)->first();

            if ($period && $period->isLocked()) {
                throw new DomainException(
                    "Cannot modify journal entry. Accounting period {$period->name} is locked. "
                    .'Please contact your finance manager to unlock the period if necessary.'
                );
            }
        });

        // Prevent deleting journal entries in locked periods
        static::deleting(function ($journalEntry) {
            $period = AccountingPeriod::forDate($journalEntry->date)->first();

            if ($period && $period->isLocked()) {
                throw new DomainException(
                    "Cannot delete journal entry. Accounting period {$period->name} is locked."
                );
            }
        });
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    public function reversedEntry()
    {
        return $this->belongsTo(JournalEntry::class, 'reversed_entry_id');
    }

    public function reversalEntries()
    {
        return $this->hasMany(JournalEntry::class, 'reversed_entry_id');
    }

    /**
     * Post journal entry to general ledger
     */
    public function post(User $user): void
    {
        if (! $this->canBePosted()) {
            throw new InvalidArgumentException('Journal entry cannot be posted');
        }

        if (! $this->isBalanced()) {
            throw new InvalidArgumentException('Journal entry must be balanced before posting');
        }

        $this->update(['status' => 'posted']);

        event(new JournalEntryPosted($this, $user, now()));
    }

    /**
     * Reverse journal entry
     */
    public function reverse(User $user, string $reason): self
    {
        if (! $this->isPosted()) {
            throw new InvalidArgumentException('Only posted entries can be reversed');
        }

        if ($this->hasBeenReversed()) {
            throw new InvalidArgumentException('Journal entry has already been reversed');
        }

        // Create reversal entry with swapped debits/credits
        $reversalEntry = self::create([
            'reference_number' => $this->reference_number.'-REV',
            'date' => now(),
            'description' => "Reversal of {$this->reference_number}: {$reason}",
            'status' => 'posted',
            'currency_code' => $this->currency_code,
            'exchange_rate' => $this->exchange_rate,
            'reversed_entry_id' => $this->id,
        ]);

        // Create reversed lines
        foreach ($this->lines as $line) {
            $reversalEntry->lines()->create([
                'chart_of_account_id' => $line->chart_of_account_id,
                'debit' => $line->credit,
                'credit' => $line->debit,
                'description' => $line->description,
            ]);
        }

        event(new JournalEntryReversed($this, $reversalEntry, $reason, $user));

        return $reversalEntry;
    }

    /**
     * Check if journal entry is balanced
     */
    public function isBalanced(): bool
    {
        $totalDebit = $this->getTotalDebit();
        $totalCredit = $this->getTotalCredit();

        return $totalDebit->equals($totalCredit);
    }

    /**
     * Check if entry can be edited
     */
    public function canBeEdited(): bool
    {
        if ($this->status !== 'draft') {
            return false;
        }

        // Check if period is locked
        $period = AccountingPeriod::forDate($this->date)->first();

        if ($period && $period->isLocked()) {
            return false;
        }

        return true;
    }

    /**
     * Check if entry can be posted
     */
    public function canBePosted(): bool
    {
        return $this->status === 'draft' && $this->lines()->count() >= 2;
    }

    /**
     * Check if entry is posted
     */
    public function isPosted(): bool
    {
        return $this->status === 'posted';
    }

    /**
     * Check if entry has been reversed
     */
    public function hasBeenReversed(): bool
    {
        return $this->reversalEntries()->exists();
    }

    /**
     * Get total debit amount
     */
    public function getTotalDebit(): Money
    {
        $total = $this->lines->sum('debit');

        return Money::from($total, $this->currency_code ?? 'USD');
    }

    /**
     * Get total credit amount
     */
    public function getTotalCredit(): Money
    {
        $total = $this->lines->sum('credit');

        return Money::from($total, $this->currency_code ?? 'USD');
    }

    /**
     * Get variance (should be zero for balanced entries)
     */
    public function getVariance(): Money
    {
        $debit = $this->getTotalDebit();
        $credit = $this->getTotalCredit();

        if ($debit->isGreaterThan($credit)) {
            return $debit->subtract($credit);
        }

        return $credit->subtract($debit);
    }
}
