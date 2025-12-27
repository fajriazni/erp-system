<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalTemplateController extends Controller
{
    /**
     * Display a listing of journal templates
     */
    public function index(Request $request): Response
    {
        $query = JournalTemplate::with('lines.account');

        if ($request->filled('filter.global')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->input('filter.global').'%')
                    ->orWhere('description', 'like', '%'.$request->input('filter.global').'%');
            });
        }

        if ($request->filled('filter.status')) {
            $status = $request->input('filter.status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $templates = $query->latest()
            ->paginate($request->input('per_page', 15))
            ->withQueryString();

        return Inertia::render('Accounting/Templates/Index', [
            'templates' => $templates,
            'filters' => $request->only('filter'),
        ]);
    }

    /**
     * Show the form for creating a new template
     */
    public function create(): Response
    {
        $accounts = ChartOfAccount::where('is_active', true)
            ->orderBy('code')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'code' => $account->code,
                    'name' => $account->name,
                    'type' => $account->type,
                    'label' => "{$account->code} - {$account->name}",
                ];
            });

        return Inertia::render('Accounting/Templates/Create', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Store a newly created template
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'lines' => 'required|array|min:2',
            'lines.*.chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit_credit' => 'required|in:debit,credit',
            'lines.*.amount_formula' => 'nullable|string|max:255',
            'lines.*.description' => 'nullable|string|max:255',
        ]);

        // Validate that template is balanced (equal debit and credit lines)
        $debitCount = collect($validated['lines'])->where('debit_credit', 'debit')->count();
        $creditCount = collect($validated['lines'])->where('debit_credit', 'credit')->count();

        if ($debitCount === 0 || $creditCount === 0) {
            return back()->withErrors([
                'lines' => 'Template must have at least one debit line and one credit line.',
            ])->withInput();
        }

        $template = JournalTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        foreach ($validated['lines'] as $index => $line) {
            $template->lines()->create([
                'chart_of_account_id' => $line['chart_of_account_id'],
                'debit_credit' => $line['debit_credit'],
                'amount_formula' => $line['amount_formula'] ?? null,
                'description' => $line['description'] ?? null,
                'sequence' => $index + 1,
            ]);
        }

        return redirect()
            ->route('accounting.templates.index')
            ->with('success', 'Template created successfully.');
    }

    /**
     * Display the specified template
     */
    public function show(JournalTemplate $template): Response
    {
        $template->load('lines.account');

        return Inertia::render('Accounting/Templates/Show', [
            'template' => $template,
        ]);
    }

    /**
     * Show the form for editing the specified template
     */
    public function edit(JournalTemplate $template): Response
    {
        $template->load('lines.account');

        $accounts = ChartOfAccount::where('is_active', true)
            ->orderBy('code')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'code' => $account->code,
                    'name' => $account->name,
                    'type' => $account->type,
                    'label' => "{$account->code} - {$account->name}",
                ];
            });

        return Inertia::render('Accounting/Templates/Edit', [
            'template' => $template,
            'accounts' => $accounts,
        ]);
    }

    /**
     * Update the specified template
     */
    public function update(Request $request, JournalTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'lines' => 'required|array|min:2',
            'lines.*.chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit_credit' => 'required|in:debit,credit',
            'lines.*.amount_formula' => 'nullable|string|max:255',
            'lines.*.description' => 'nullable|string|max:255',
        ]);

        // Validate balance
        $debitCount = collect($validated['lines'])->where('debit_credit', 'debit')->count();
        $creditCount = collect($validated['lines'])->where('debit_credit', 'credit')->count();

        if ($debitCount === 0 || $creditCount === 0) {
            return back()->withErrors([
                'lines' => 'Template must have at least one debit line and one credit line.',
            ])->withInput();
        }

        $template->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Delete existing lines and recreate
        $template->lines()->delete();

        foreach ($validated['lines'] as $index => $line) {
            $template->lines()->create([
                'chart_of_account_id' => $line['chart_of_account_id'],
                'debit_credit' => $line['debit_credit'],
                'amount_formula' => $line['amount_formula'] ?? null,
                'description' => $line['description'] ?? null,
                'sequence' => $index + 1,
            ]);
        }

        return redirect()
            ->route('accounting.templates.index')
            ->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified template
     */
    public function destroy(JournalTemplate $template): RedirectResponse
    {
        $template->delete();

        return redirect()
            ->route('accounting.templates.index')
            ->with('success', 'Template deleted successfully.');
    }
}
