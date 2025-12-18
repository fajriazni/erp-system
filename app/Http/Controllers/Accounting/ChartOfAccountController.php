<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChartOfAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\ChartOfAccount::with('children')
            ->whereNull('parent_id')
            ->orderBy('code');

        if ($request->has('search')) {
            $search = $request->search;
            // If searching, we might want a flat list or filtered tree.
            // For simplicity in tree view, search usually filters top level or we switch to flat list.
            // Let's implement a flat list search if search is present, otherwise tree.
            if ($search) {
                return \Inertia\Inertia::render('Accounting/COA/Index', [
                    'accounts' => \App\Models\ChartOfAccount::where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->with('parent')
                        ->orderBy('code')
                        ->get(),
                    'isSearch' => true,
                    'filters' => $request->only(['search']),
                ]);
            }
        }

        return \Inertia\Inertia::render('Accounting/COA/Index', [
            'accounts' => $query->get(), // This will be recursive if we use a recursive component on frontend
            'isSearch' => false,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return \Inertia\Inertia::render('Accounting/COA/Create', [
            'parents' => \App\Models\ChartOfAccount::orderBy('code')->get(),
            'types' => ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:chart_of_accounts,code',
            'name' => 'required|string',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,REVENUE,EXPENSE',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        \App\Models\ChartOfAccount::create($validated);

        return redirect()->route('accounting.coa.index')
            ->with('success', 'Account created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(\App\Models\ChartOfAccount $coa)
    {
        return \Inertia\Inertia::render('Accounting/COA/Edit', [
            'account' => $coa,
            'parents' => \App\Models\ChartOfAccount::where('id', '!=', $coa->id)->orderBy('code')->get(),
            'types' => ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\ChartOfAccount $coa)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:chart_of_accounts,code,'.$coa->id,
            'name' => 'required|string',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,REVENUE,EXPENSE',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validated['parent_id'] == $coa->id) {
            return back()->withErrors(['parent_id' => 'Cannot be parent of itself.']);
        }

        $coa->update($validated);

        return redirect()->route('accounting.coa.index')
            ->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\ChartOfAccount $coa)
    {
        if ($coa->children()->exists()) {
            return back()->with('error', 'Cannot delete account with sub-accounts.');
        }

        // Check if used in journal entries (future check)

        $coa->delete();

        return redirect()->route('accounting.coa.index')
            ->with('success', 'Account deleted successfully.');
    }
}
