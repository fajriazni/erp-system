<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountingPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status',
        'locked_at',
        'locked_by',
        'unlocked_at',
        'unlocked_by',
        'lock_notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'locked_at' => 'datetime',
        'unlocked_at' => 'datetime',
    ];

    // Relationships
    public function lockedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    public function unlockedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'unlocked_by');
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeLocked($query)
    {
        return $query->where('status', 'locked');
    }

    public function scopeForDate($query, $date)
    {
        $carbonDate = Carbon::parse($date);

        return $query->where('start_date', '<=', $carbonDate)
            ->where('end_date', '>=', $carbonDate);
    }

    // Domain Methods
    public function lock(User $user, ?string $notes = null): void
    {
        if ($this->status === 'locked') {
            throw new \DomainException("Period {$this->name} is already locked.");
        }

        $this->update([
            'status' => 'locked',
            'locked_at' => now(),
            'locked_by' => $user->id,
            'lock_notes' => $notes,
        ]);
    }

    public function unlock(User $user): void
    {
        if ($this->status === 'open') {
            throw new \DomainException("Period {$this->name} is already open.");
        }

        $this->update([
            'status' => 'open',
            'unlocked_at' => now(),
            'unlocked_by' => $user->id,
        ]);
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    // Helper to create monthly periods
    public static function createMonthly(int $year, int $month): self
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $name = $startDate->format('Y-m');

        return self::create([
            'name' => $name,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => 'open',
        ]);
    }
}
