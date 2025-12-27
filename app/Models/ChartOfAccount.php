<?php

namespace App\Models;

use App\Domain\Finance\ValueObjects\AccountCode;
use App\Domain\Finance\ValueObjects\AccountingPeriod;
use App\Domain\Finance\ValueObjects\Money;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ChartOfAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'description',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_id');
    }

    public function children(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_id');
    }

    public function journalEntryLines(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JournalEntryLine::class, 'chart_of_account_id');
    }

    /**
     * Check if account is an asset
     */
    public function isAsset(): bool
    {
        return $this->type === 'asset';
    }

    /**
     * Check if account is a liability
     */
    public function isLiability(): bool
    {
        return $this->type === 'liability';
    }

    /**
     * Check if account is equity
     */
    public function isEquity(): bool
    {
        return $this->type === 'equity';
    }

    /**
     * Check if account is revenue
     */
    public function isRevenue(): bool
    {
        return $this->type === 'revenue';
    }

    /**
     * Check if account is an expense
     */
    public function isExpense(): bool
    {
        return $this->type === 'expense';
    }

    /**
     * Get account balance for a specific period
     */
    public function getBalance(AccountingPeriod $period): Money
    {
        $balance = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.chart_of_account_id', $this->id)
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [
                $period->startDate(),
                $period->endDate(),
            ])
            ->sum(DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        // Reverse sign for liability, equity, and revenue accounts
        if (in_array($this->type, ['liability', 'equity', 'revenue'])) {
            $balance = -$balance;
        }

        return Money::from(abs($balance), 'USD');
    }

    /**
     * Get normal balance side (debit or credit)
     */
    public function normalBalance(): string
    {
        return match ($this->type) {
            'asset', 'expense' => 'debit',
            'liability', 'equity', 'revenue' => 'credit',
            default => '  debit',
        };
    }

    /**
     * Get account code as Value Object
     */
    public function getAccountCode(): AccountCode
    {
        return AccountCode::from($this->code);
    }

    /**
     * Check if account has children
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Check if account is a parent (header) account
     */
    public function isParent(): bool
    {
        return $this->hasChildren();
    }

    /**
     * Check if account is a leaf (detail) account
     */
    public function isLeaf(): bool
    {
        return ! $this->hasChildren();
    }
}
