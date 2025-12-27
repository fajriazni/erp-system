<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Finance\Contracts\ChartOfAccountRepositoryInterface;
use App\Domain\Finance\Services\CreateChartOfAccountService;
use App\Domain\Finance\Services\DeleteChartOfAccountService;
use App\Domain\Finance\Services\UpdateChartOfAccountService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Accounting\StoreChartOfAccountRequest;
use App\Http\Requests\Accounting\UpdateChartOfAccountRequest;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChartOfAccountController extends Controller
{
    public function __construct(
        private readonly ChartOfAccountRepositoryInterface $repository,
        private readonly CreateChartOfAccountService $createService,
        private readonly UpdateChartOfAccountService $updateService,
        private readonly DeleteChartOfAccountService $deleteService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has('search') && $request->filled('search')) {
            $search = $request->search;

            return Inertia::render('Accounting/COA/Index', [
                'accounts' => ChartOfAccount::where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->with('parent')
                    ->orderBy('code')
                    ->get()
                    ->map(fn ($account) => array_merge($account->toArray(), [
                        'balance' => $this->getAccountBalance($account->id),
                    ])),
                'isSearch' => true,
                'filters' => $request->only(['search']),
                'stats' => $this->getSummaryStats(),
            ]);
        }

        $tree = $this->repository->getHierarchyTree()->map(fn ($account) => $this->buildHierarchyNode($account));

        return Inertia::render('Accounting/COA/Index', [
            'accounts' => $tree,
            'isSearch' => false,
            'filters' => $request->only(['search']),
            'stats' => $this->getSummaryStats(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Accounting/COA/Create', [
            'parents' => $this->repository->getActive(),
            'types' => ['asset', 'liability', 'equity', 'revenue', 'expense'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChartOfAccountRequest $request)
    {
        try {
            $account = $this->createService->execute($request->validated());

            return redirect()->route('accounting.coa.index')
                ->with('success', 'Account created successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ChartOfAccount $coa)
    {
        $coa->load(['parent', 'children']);

        return Inertia::render('Accounting/COA/Show', [
            'account' => $coa,
            'balance' => $this->getAccountBalance($coa->id),
            'recentTransactions' => $this->getRecentTransactions($coa->id),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ChartOfAccount $coa)
    {
        return Inertia::render('Accounting/COA/Edit', [
            'account' => $coa,
            'parents' => $this->repository->getActive()->filter(fn ($a) => $a->id !== $coa->id)->values(),
            'types' => ['asset', 'liability', 'equity', 'revenue', 'expense'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChartOfAccountRequest $request, ChartOfAccount $coa)
    {
        try {
            $account = $this->updateService->execute($coa, $request->validated());

            return redirect()->route('accounting.coa.index')
                ->with('success', 'Account updated successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ChartOfAccount $coa)
    {
        try {
            $this->deleteService->execute($coa);

            return redirect()->route('accounting.coa.index')
                ->with('success', 'Account deleted successfully.');
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Recursively build hierarchy tree with balances
     */
    private function buildHierarchyNode(ChartOfAccount $account): array
    {
        return [
            'id' => $account->id,
            'code' => $account->code,
            'name' => $account->name,
            'type' => $account->type,
            'is_active' => $account->is_active,
            'balance' => $this->getAccountBalance($account->id),
            'children' => $account->children->isNotEmpty()
                ? $account->children->map(fn ($child) => $this->buildHierarchyNode($child))->toArray()
                : [],
        ];
    }

    /**
     * Calculate account balance from journal entries
     */
    private function getAccountBalance(int $accountId): float
    {
        $balance = \DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.chart_of_account_id', $accountId)
            ->where('journal_entries.status', 'posted')
            ->sum(\DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        return round($balance, 2);
    }

    /**
     * Get recent transactions for an account
     */
    private function getRecentTransactions(int $accountId, int $limit = 10): array
    {
        return \DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.chart_of_account_id', $accountId)
            ->select([
                'journal_entries.id',
                'journal_entries.reference_number',
                'journal_entries.date',
                'journal_entries.description',
                'journal_entry_lines.debit',
                'journal_entry_lines.credit',
            ])
            ->orderBy('journal_entries.date', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get summary statistics for COA dashboard
     */
    private function getSummaryStats(): array
    {
        $assets = $this->getTotalBalanceByType('asset');
        $liabilities = $this->getTotalBalanceByType('liability');
        $equity = $this->getTotalBalanceByType('equity');

        return [
            'totalAssets' => $assets,
            'totalLiabilities' => $liabilities,
            'totalEquity' => $equity,
            'netWorth' => $assets - $liabilities,
        ];
    }

    /**
     * Get total balance for a specific account type
     */
    private function getTotalBalanceByType(string $type): float
    {
        $balance = \DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('chart_of_accounts', 'journal_entry_lines.chart_of_account_id', '=', 'chart_of_accounts.id')
            ->where('chart_of_accounts.type', $type)
            ->where('journal_entries.status', 'posted')
            ->sum(\DB::raw('journal_entry_lines.debit - journal_entry_lines.credit'));

        return round(abs($balance), 2);
    }
}
