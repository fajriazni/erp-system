<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = QueryBuilder::for(Contact::class)
            ->where(function ($query) {
                $query->where('type', 'vendor')
                    ->orWhere('type', 'both');
            })
            ->allowedFilters([
                'name',
                'email',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where('name', 'like', "%{$value}%")
                        ->orWhere('email', 'like', "%{$value}%")
                        ->orWhere('phone', 'like', "%{$value}%");
                }),
            ])
            ->allowedSorts(['name', 'email', 'created_at'])
            ->defaultSort('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchasing/vendors/index', [
            'vendors' => $vendors,
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/vendors/form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:100',
        ]);

        $validated['type'] = 'vendor';

        Contact::create($validated);

        return redirect()->route('purchasing.vendors.index')->with('success', 'Vendor created successfully.');
    }

    public function edit(Contact $vendor)
    {
        return Inertia::render('Purchasing/vendors/form', [
            'vendor' => $vendor,
        ]);
    }

    public function update(Request $request, Contact $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:100',
        ]);

        $vendor->update($validated);

        return redirect()->route('purchasing.vendors.index')->with('success', 'Vendor updated successfully.');
    }

    public function destroy(Contact $vendor)
    {
        $vendor->delete();

        return redirect()->route('purchasing.vendors.index')->with('success', 'Vendor deleted successfully.');
    }
}
