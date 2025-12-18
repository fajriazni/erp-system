<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\AssetCategory;
use App\Domain\Assets\Services\CreateAssetService;
use App\Domain\Assets\Services\RunDepreciationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        return Inertia::render('Accounting/Assets/Index', [
            'assets' => Asset::with('category')->latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounting/Assets/Create', [
            'categories' => AssetCategory::all(),
        ]);
    }

    public function store(Request $request, CreateAssetService $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'asset_number' => 'required|string|unique:assets,asset_number',
            'category_id' => 'required|exists:asset_categories,id',
            'purchase_date' => 'required|date',
            'start_depreciation_date' => 'nullable|date',
            'cost' => 'required|numeric|min:0',
            'salvage_value' => 'nullable|numeric|min:0',
            'serial_number' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $service->execute($validated);

        return redirect()->route('accounting.assets.index')
            ->with('success', 'Asset created successfully.');
    }

    public function show(Asset $asset)
    {
        $asset->load(['category', 'depreciationEntries.journalEntry']);

        return Inertia::render('Accounting/Assets/Show', [
            'asset' => $asset,
        ]);
    }

    public function runDepreciation(Request $request, RunDepreciationService $service)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $processed = $service->execute($request->date);

        return back()->with('success', "Depreciation run successfully for {$processed->count()} assets.");
    }
}
