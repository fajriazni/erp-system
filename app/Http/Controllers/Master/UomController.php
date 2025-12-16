<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Uom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class UomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $uoms = QueryBuilder::for(Uom::class)
            ->allowedFilters([
                'name',
                'symbol',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%")
                            ->orWhere('symbol', 'like', "%{$value}%");
                    });
                }),
            ])
            ->allowedSorts(['name', 'symbol', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/uoms/index', [
            'uoms' => $uoms,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/uoms/form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'symbol' => 'nullable|string|max:50',
        ]);

        Uom::create($validated);

        return redirect()->route('master.uoms.index')->with('success', 'UoM created successfully.');
    }

    public function edit(Uom $uom)
    {
        return Inertia::render('master/uoms/form', [
            'uom' => $uom,
        ]);
    }

    public function update(Request $request, Uom $uom)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'symbol' => 'nullable|string|max:50',
        ]);

        $uom->update($validated);

        return redirect()->route('master.uoms.index')->with('success', 'UoM updated successfully.');
    }

    public function destroy(Uom $uom)
    {
        $uom->delete();

        return redirect()->route('master.uoms.index')->with('success', 'UoM deleted successfully.');
    }
}
