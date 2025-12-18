<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Finance\Services\CreateJournalEntryService;
use App\Domain\Finance\Services\UpdateJournalEntryService;
use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JournalEntryController extends Controller
{
    public function __construct(
        protected CreateJournalEntryService $createService,
        protected UpdateJournalEntryService $updateService
    ) {}

    public function index()
    {
        return Inertia::render('Accounting/JournalEntries/Index', [
            'entries' => JournalEntry::withCount('lines')
                ->latest('date')
                ->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounting/JournalEntries/Create', [
            'chartOfAccounts' => \App\Models\ChartOfAccount::where('is_active', true)
                ->orderBy('code')
                ->get()
                ->map(function ($account) {
                    return [
                        'id' => $account->id,
                        'name' => $account->code.' - '.$account->name,
                        'type' => $account->type,
                    ];
                }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'nullable|string',
            'currency_code' => 'required|string|size:3',
            'exchange_rate' => 'required|numeric|min:0.000001',
            'lines' => 'required|array|min:2',
            'lines.*.chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
        ]);

        // Generate a temporary reference or let the service handle it (if updated)
        // For now, let's generate it here or pass a placeholder if service requires it
        // The service signature is: execute(string $date, string $referenceNumber, ?string $description, array $lines)

        // We really should move generation to service, but for now let's do it here to match existing service signature
        $referenceNumber = 'JE-'.date('Ym', strtotime($validated['date'])).'-'.uniqid();

        $this->createService->execute(
            $validated['date'],
            $referenceNumber, // Service requires this
            $validated['description'],
            $validated['lines'],
            $validated['currency_code'] ?? 'USD',
            $validated['exchange_rate'] ?? 1.0,
        );

        return redirect()->route('accounting.journal-entries.index')
            ->with('success', 'Journal Entry created successfully.');
    }

    public function show(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines.chartOfAccount');

        return Inertia::render('Accounting/JournalEntries/Show', [
            'entry' => $journalEntry,
        ]);
    }

    public function edit(JournalEntry $journalEntry)
    {
        if ($journalEntry->status === 'posted') {
            return redirect()->route('accounting.journal-entries.show', $journalEntry)
                ->with('error', 'Cannot edit a posted journal entry.');
        }

        $journalEntry->load('lines');

        return Inertia::render('Accounting/JournalEntries/Edit', [
            'entry' => $journalEntry,
            'chartOfAccounts' => \App\Models\ChartOfAccount::where('is_active', true)
                ->orderBy('code')
                ->get()
                ->map(function ($account) {
                    return [
                        'id' => $account->id,
                        'name' => $account->code.' - '.$account->name,
                        'type' => $account->type,
                    ];
                }),
        ]);
    }

    public function update(Request $request, JournalEntry $journalEntry)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'nullable|string',
            'currency_code' => 'required|string|size:3',
            'exchange_rate' => 'required|numeric|min:0.000001',
            'lines' => 'required|array|min:2',
            'lines.*.chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
        ]);

        $this->updateService->execute(
            $journalEntry,
            $validated['date'],
            $validated['description'],
            $validated['lines'],
            $validated['currency_code'] ?? 'USD',
            $validated['exchange_rate'] ?? 1.0,
        );

        return redirect()->route('accounting.journal-entries.index')
            ->with('success', 'Journal Entry updated successfully.');
    }
}
