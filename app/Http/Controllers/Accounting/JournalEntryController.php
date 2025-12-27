<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JournalEntryController extends Controller
{
    public function __construct(
        protected \App\Application\Commands\CreateJournalEntryService $createService,
        protected \App\Application\Commands\UpdateJournalEntryService $updateService,
        protected \App\Domain\Accounting\Repositories\JournalEntryRepositoryInterface $journalRepository
    ) {}

    public function index(Request $request)
    {
        $query = JournalEntry::withCount('lines')
            ->when($request->input('filter.global'), function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('reference_number', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->input('filter.status'), function ($q, $status) {
                $q->where('status', $status);
            })
            ->latest('date');

        return Inertia::render('Accounting/JournalEntries/Index', [
            'entries' => $query->paginate($request->input('per_page', 15))->withQueryString(),
            'filters' => $request->only(['filter', 'per_page']),
            'filterOptions' => [
                'statuses' => ['draft', 'posted'],
            ],
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
                        'code' => $account->code,
                        'name' => $account->name,
                        'type' => $account->type,
                    ];
                }),
            'journalTemplates' => \App\Models\JournalTemplate::with('lines')
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(function ($template) {
                    return [
                        'id' => $template->id,
                        'name' => $template->name,
                        'description' => $template->description,
                        'lines' => $template->lines->map(function ($line) {
                            return [
                                'chart_of_account_id' => $line->chart_of_account_id,
                                'debit_credit' => $line->debit_credit,
                                'description' => $line->description,
                            ];
                        }),
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
            'lines.*.description' => 'nullable|string',
        ]);

        // Map lines to the format expected by the new service
        $lines = array_map(function ($line) use ($validated) {
            $amount = $line['debit'] > 0 ? $line['debit'] : $line['credit'];
            $type = $line['debit'] > 0 ? 'debit' : 'credit';

            return [
                'account_id' => $line['chart_of_account_id'],
                'amount' => (float) $amount,
                'type' => $type,
                'description' => $line['description'] ?? null,
                'currency' => $validated['currency_code'],
            ];
        }, $validated['lines']);

        try {
            $this->createService->execute(
                $validated['date'],
                $validated['description'] ?? '',
                $lines,
                $validated['currency_code']
            );

            return redirect()->route('accounting.journal-entries.index')
                ->with('success', 'Journal Entry created successfully.');
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['error' => $e->getMessage()]);
        }
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
                        'code' => $account->code,
                        'name' => $account->name,
                        'type' => $account->type,
                    ];
                }),
        ]);
    }

    public function update(Request $request, int $id)
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
            'lines.*.description' => 'nullable|string',
        ]);

        // Map lines to the format expected by the new service
        $lines = array_map(function ($line) {
            $amount = $line['debit'] > 0 ? $line['debit'] : $line['credit'];
            $type = $line['debit'] > 0 ? 'debit' : 'credit';

            return [
                'account_id' => $line['chart_of_account_id'],
                'amount' => (float) $amount,
                'type' => $type,
                'description' => $line['description'] ?? null,
            ];
        }, $validated['lines']);

        try {
            $this->updateService->execute(
                $id,
                $validated['date'],
                $validated['description'] ?? '',
                $lines,
                $validated['currency_code']
            );

            return redirect()->route('accounting.journal-entries.index')
                ->with('success', 'Journal Entry updated successfully.');
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
