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
        return Inertia::render('Purchasing/vendors/form', [
            'paymentTerms' => \App\Models\PaymentTerm::where('is_active', true)->select('id', 'name', 'description')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:100',
            'payment_term_id' => 'nullable|exists:payment_terms,id',
        ]);

        $validated['type'] = 'vendor';

        Contact::create($validated);

        return redirect()->route('purchasing.vendors.index')->with('success', 'Vendor created successfully.');
    }

    public function show(Contact $vendor)
    {
        // Update vendor scorecard metrics
        app(\App\Domain\Purchasing\Services\VendorScorecardService::class)->updateVendorMetrics($vendor);
        $vendor->refresh();

        // Load recent purchase orders (last 5)
        $recentOrders = $vendor->purchaseOrders()
            ->with('items')
            ->latest()
            ->limit(5)
            ->get();

        // Load recent goods receipts (last 5) - via purchase orders
        $recentReceipts = \App\Models\GoodsReceipt::whereHas('purchaseOrder', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->with('purchaseOrder')
            ->latest()
            ->limit(5)
            ->get();

        // Calculate performance metrics
        $totalOrders = $vendor->purchaseOrders()->count();
        $totalSpent = $vendor->purchaseOrders()->where('status', '!=', 'cancelled')->sum('total');
        $avgOrderValue = $totalOrders > 0 ? $totalSpent / $totalOrders : 0;

        return Inertia::render('Purchasing/vendors/show', [
            'vendor' => $vendor,
            'recentOrders' => $recentOrders,
            'recentReceipts' => $recentReceipts,
            'performance' => [
                'totalOrders' => $totalOrders,
                'totalSpent' => $totalSpent,
                'avgOrderValue' => $avgOrderValue,
            ],
        ]);
    }

    public function edit(Contact $vendor)
    {
        return Inertia::render('Purchasing/vendors/form', [
            'vendor' => $vendor,
            'paymentTerms' => \App\Models\PaymentTerm::where('is_active', true)->select('id', 'name', 'description')->get(),
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
            'payment_term_id' => 'nullable|exists:payment_terms,id',
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
