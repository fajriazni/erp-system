<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Accounting\Aggregates\PostingRule\PostingRule;
use App\Domain\Accounting\Aggregates\PostingRule\PostingRuleLine;
use App\Domain\Accounting\Repositories\PostingRuleRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostingRuleController extends Controller
{
    public function __construct(
        private readonly PostingRuleRepositoryInterface $repository
    ) {}

    public function index()
    {
        return Inertia::render('Accounting/Settings/PostingRules', [
            'rules' => \App\Models\PostingRule::with('lines')->orderBy('module')->orderBy('event_type')->get(),
            'chartOfAccounts' => ChartOfAccount::where('is_active', true)->orderBy('code')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounting/Settings/PostingRules/Create', [
            'chartOfAccounts' => ChartOfAccount::where('is_active', true)->orderBy('code')->get(),
            'modules' => ['Sales', 'Purchasing', 'Inventory'],
            'amountKeys' => [
                'total_amount' => 'Total Amount',
                'subtotal' => 'Subtotal',
                'tax_amount' => 'Tax Amount',
                'net_amount' => 'Net Amount',
            ],
        ]);
    }

    public function edit(int $id)
    {
        $rule = \App\Models\PostingRule::with('lines')->findOrFail($id);

        return Inertia::render('Accounting/Settings/PostingRules/Edit', [
            'rule' => $rule,
            'chartOfAccounts' => ChartOfAccount::where('is_active', true)->orderBy('code')->get(),
            'modules' => ['Sales', 'Purchasing', 'Inventory'],
            'amountKeys' => [
                'total_amount' => 'Total Amount',
                'subtotal' => 'Subtotal',
                'tax_amount' => 'Tax Amount',
                'net_amount' => 'Net Amount',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_type' => 'required|string|unique:posting_rules,event_type',
            'description' => 'required|string',
            'module' => 'required|string',
            'lines' => 'required|array|min:2',
            'lines.*.chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit_credit' => 'required|in:debit,credit',
            'lines.*.amount_key' => 'required|string',
        ]);

        $rule = PostingRule::create(
            $validated['event_type'],
            $validated['description'],
            $validated['module']
        );

        foreach ($validated['lines'] as $lineData) {
            $rule->addLine(PostingRuleLine::create(
                $lineData['chart_of_account_id'],
                $lineData['debit_credit'],
                $lineData['amount_key'],
                $lineData['description_template'] ?? null
            ));
        }

        $this->repository->save($rule);

        return back()->with('success', 'Posting Rule created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'module' => 'required|string',
            'is_active' => 'required|boolean',
            'lines' => 'required|array|min:2',
            'lines.*.chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit_credit' => 'required|in:debit,credit',
            'lines.*.amount_key' => 'required|string',
        ]);

        $existing = $this->repository->findById($id);
        if (! $existing) {
            return back()->withErrors(['error' => 'Rule not found.']);
        }

        $rule = PostingRule::reconstruct(
            $id,
            $existing->eventType(),
            $validated['description'],
            $validated['module'],
            $validated['is_active'],
            []
        );

        foreach ($validated['lines'] as $lineData) {
            $rule->addLine(PostingRuleLine::create(
                $lineData['chart_of_account_id'],
                $lineData['debit_credit'],
                $lineData['amount_key'],
                $lineData['description_template'] ?? null
            ));
        }

        $this->repository->save($rule);

        return back()->with('success', 'Posting Rule updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->repository->delete($id);

        return back()->with('success', 'Posting Rule deleted successfully.');
    }
}
