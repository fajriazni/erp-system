<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'period',
        'start_date',
        'end_date',
        'input_tax',
        'output_tax',
        'net_tax',
        'status',
        'submitted_at',
        'submitted_by',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'input_tax' => 'decimal:2',
        'output_tax' => 'decimal:2',
        'net_tax' => 'decimal:2',
        'submitted_at' => 'datetime',
    ];

    protected $appends = [
        'is_payable',
        'is_claimable',
    ];

    // Relationships
    public function submittedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    // Domain Methods
    public function calculate(): void
    {
        $inputTax = VendorBill::whereBetween('date', [$this->start_date, $this->end_date])
            ->where('status', 'posted')
            ->sum('tax_amount');

        $outputTax = CustomerInvoice::whereBetween('date', [$this->start_date, $this->end_date])
            ->where('status', 'posted')
            ->sum('tax_amount');

        $this->update([
            'input_tax' => $inputTax,
            'output_tax' => $outputTax,
            // Input - Output: negative = payable (owe tax), positive = claimable (get refund)
            'net_tax' => $inputTax - $outputTax,
        ]);
    }

    public function submit(User $user, ?string $notes = null): void
    {
        if ($this->status === 'submitted') {
            throw new \DomainException("Tax period {$this->period} has already been submitted.");
        }

        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'submitted_by' => $user->id,
            'notes' => $notes,
        ]);
    }

    // Accessors
    public function getIsPayableAttribute(): bool
    {
        // Payable when output > input (net_tax is negative)
        return $this->net_tax < 0;
    }

    public function getIsClaimableAttribute(): bool
    {
        // Claimable when input > output (net_tax is positive)
        return $this->net_tax > 0;
    }

    // Helper to create monthly tax period
    public static function createMonthly(int $year, int $month): self
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $period = $startDate->format('Y-m');

        return self::firstOrCreate(
            ['period' => $period],
            [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'draft',
            ]
        );
    }
}
