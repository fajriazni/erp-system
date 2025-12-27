<?php

namespace App\Http\Controllers\Accounting;

use App\Application\Services\Accounting\DeferredScheduleService;
use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\DeferredSchedule;
use App\Models\DeferredScheduleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeferredScheduleController extends Controller
{
    public function __construct(
        private readonly DeferredScheduleService $service
    ) {}

    public function index(Request $request)
    {
        $status = $request->input('status', 'active');
        
        $schedules = DeferredSchedule::query()
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->with(['deferredAccount', 'recognitionAccount'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Accounting/Deferred/Index', [
            'schedules' => $schedules,
            'filters' => ['status' => $status],
        ]);
    }

    public function create()
    {
        // Get Asset/Liability accounts for "Deferred Account"
        // Get Revenue/Expense accounts for "Recognition Account"
        $accounts = ChartOfAccount::select(['id', 'code', 'name', 'type'])
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/Deferred/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:deferred_schedules,code',
            'name' => 'required|string',
            'type' => 'required|in:revenue,expense',
            'total_amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'deferred_account_id' => 'required|exists:chart_of_accounts,id',
            'recognition_account_id' => 'required|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
        ]);

        $schedule = $this->service->createSchedule($validated);

        return redirect()->route('deferred.show', $schedule)
            ->with('success', 'Deferred schedule created successfully.');
    }

    public function show(DeferredSchedule $schedule)
    {
        $schedule->load(['items.journalEntry', 'deferredAccount', 'recognitionAccount']);

        return Inertia::render('Accounting/Deferred/Show', [
            'schedule' => $schedule,
        ]);
    }

    public function processItem(DeferredScheduleItem $item)
    {
        try {
            $this->service->processItem($item, request()->user());
            return back()->with('success', 'Journal entry processed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
