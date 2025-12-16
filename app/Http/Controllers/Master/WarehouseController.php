<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $warehouses = QueryBuilder::for(Warehouse::class)
            ->allowedFilters([
                'name',
                'address',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%")
                            ->orWhere('address', 'like', "%{$value}%");
                    });
                }),
            ])
            ->allowedSorts(['name', 'address', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/warehouses/index', [
            'warehouses' => $warehouses,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/warehouses/form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        Warehouse::create($validated);

        return redirect()->route('master.warehouses.index')->with('success', 'Warehouse created successfully.');
    }

    public function edit(Warehouse $warehouse)
    {
        return Inertia::render('master/warehouses/form', [
            'warehouse' => $warehouse,
        ]);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $warehouse->update($validated);

        return redirect()->route('master.warehouses.index')->with('success', 'Warehouse updated successfully.');
    }

    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();

        return redirect()->route('master.warehouses.index')->with('success', 'Warehouse deleted successfully.');
    }
}
