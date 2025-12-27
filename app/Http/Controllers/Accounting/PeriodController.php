<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodController extends Controller
{
    public function __construct(
        private readonly \App\Domain\Accounting\Repositories\AccountingPeriodRepositoryInterface $periodRepository,
        private readonly \App\Domain\Accounting\DomainServices\PeriodValidationService $validationService
    ) {}

    /**
     * Display a listing of accounting periods.
     */
    public function index(Request $request)
    {
        $periods = AccountingPeriod::query()
            ->with(['lockedByUser', 'unlockedByUser'])
            ->when($request->filled('status') && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->filled('year'), function ($query) use ($request) {
                $year = $request->year;
                $query->whereYear('start_date', $year);
            })
            ->orderByDesc('start_date')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Accounting/Closing/Periods', [
            'periods' => $periods,
            'filters' => $request->only(['status', 'year']),
            'availableYears' => $this->getAvailableYears(),
        ]);
    }

    /**
     * Store a newly created accounting period.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        try {
            $range = \App\Domain\Accounting\ValueObjects\DateRange::fromStrings($validated['start_date'], $validated['end_date']);
            $this->validationService->ensureNoOverlap($range);

            $period = \App\Domain\Accounting\Aggregates\AccountingPeriod\AccountingPeriod::create(
                0, // ID 0 for new
                $validated['name'],
                $range,
                'open'
            );

            $this->periodRepository->save($period);

            return redirect()->route('accounting.periods.index')
                ->with('success', 'Accounting period created successfully.');
        } catch (\DomainException $e) {
            return back()->withErrors(['start_date' => $e->getMessage()]);
        }
    }

    /**
     * Lock an accounting period.
     */
    public function lock(Request $request, int $id)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $period = $this->periodRepository->findById($id);
        if (! $period) {
            return back()->withErrors(['error' => 'Period not found.']);
        }

        try {
            $period->lock($request->user()->id);
            $this->periodRepository->save($period);

            return back()->with('success', "Period {$period->name()} has been locked successfully.");
        } catch (\DomainException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Unlock an accounting period.
     */
    public function unlock(int $id)
    {
        $period = $this->periodRepository->findById($id);
        if (! $period) {
            return back()->withErrors(['error' => 'Period not found.']);
        }

        try {
            $period->unlock();
            $this->periodRepository->save($period);

            return back()->with('success', "Period {$period->name()} has been unlocked successfully.");
        } catch (\DomainException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Update an accounting period.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $period = $this->periodRepository->findById($id);
        if (! $period) {
            return back()->withErrors(['error' => 'Period not found.']);
        }

        if ($period->isLocked()) {
            return back()->withErrors(['error' => 'Cannot edit a locked period.']);
        }

        try {
            $range = \App\Domain\Accounting\ValueObjects\DateRange::fromStrings($validated['start_date'], $validated['end_date']);
            $this->validationService->ensureNoOverlap($range, $id);

            // In a real aggregate, we might have a rename or updateRange method
            $updatedPeriod = \App\Domain\Accounting\Aggregates\AccountingPeriod\AccountingPeriod::reconstruct(
                $id,
                $validated['name'],
                $range,
                $period->status(),
                $period->lockedBy(),
                $period->lockedAt()
            );

            $this->periodRepository->save($updatedPeriod);

            return back()->with('success', 'Period updated successfully.');
        } catch (\DomainException $e) {
            return back()->withErrors(['start_date' => $e->getMessage()]);
        }
    }

    /**
     * Delete an accounting period.
     */
    public function destroy(AccountingPeriod $period)
    {
        // Cannot delete locked periods
        if ($period->status === 'locked') {
            return back()->withErrors(['error' => 'Cannot delete a locked period. Unlock it first.']);
        }

        // Check if period has journal entries
        $hasEntries = \App\Models\JournalEntry::whereBetween('date', [$period->start_date, $period->end_date])
            ->exists();

        if ($hasEntries) {
            return back()->withErrors(['error' => 'Cannot delete period with existing journal entries.']);
        }

        $period->delete();

        return redirect()->route('accounting.periods.index')
            ->with('success', 'Period deleted successfully.');
    }

    /**
     * Get available years for filtering.
     */
    private function getAvailableYears(): array
    {
        // Use database-agnostic approach
        $years = AccountingPeriod::all()
            ->map(fn ($period) => (int) \Carbon\Carbon::parse($period->start_date)->year)
            ->unique()
            ->sort()
            ->reverse()
            ->values()
            ->toArray();

        // Add current year if not present
        $currentYear = (int) now()->year;
        if (! in_array($currentYear, $years)) {
            $years[] = $currentYear;
            sort($years);
            $years = array_reverse($years);
        }

        return $years;
    }
}
