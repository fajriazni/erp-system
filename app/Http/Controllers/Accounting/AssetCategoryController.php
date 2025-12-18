<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Assets\Models\AssetCategory;
use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Accounting/Assets/Categories/Index', [
            'categories' => AssetCategory::with(['assetAccount', 'accumulatedDepreciationAccount', 'depreciationExpenseAccount'])
                ->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounting/Assets/Categories/Create', [
            'accounts' => ChartOfAccount::where('is_group', false)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:asset_categories,code',
            'useful_life_years' => 'required|integer|min:1',
            'asset_account_id' => 'required|exists:chart_of_accounts,id',
            'accumulated_depreciation_account_id' => 'required|exists:chart_of_accounts,id',
            'depreciation_expense_account_id' => 'required|exists:chart_of_accounts,id',
        ]);

        AssetCategory::create($validated);

        return redirect()->route('accounting.assets.categories.index')
            ->with('success', 'Asset Category created successfully.');
    }

    public function edit(AssetCategory $category)
    {
        return Inertia::render('Accounting/Assets/Categories/Edit', [
            'category' => $category,
            'accounts' => ChartOfAccount::where('is_group', false)->get(),
        ]);
    }

    public function update(Request $request, AssetCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:asset_categories,code,'.$category->id,
            'useful_life_years' => 'required|integer|min:1',
            'asset_account_id' => 'required|exists:chart_of_accounts,id',
            'accumulated_depreciation_account_id' => 'required|exists:chart_of_accounts,id',
            'depreciation_expense_account_id' => 'required|exists:chart_of_accounts,id',
        ]);

        $category->update($validated);

        return redirect()->route('accounting.assets.categories.index')
            ->with('success', 'Asset Category updated successfully.');
    }
}
