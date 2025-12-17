<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Product;
use App\Models\VendorPricelist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PricelistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = VendorPricelist::query()
            ->with(['vendor', 'product']);

        if ($request->search) {
            $query->whereHas('vendor', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })
                ->orWhereHas('product', function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%")
                        ->orWhere('code', 'like', "%{$request->search}%");
                })
                ->orWhere('vendor_product_code', 'like', "%{$request->search}%");
        }

        $pricelists = $query->orderBy('updated_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchasing/pricelists/index', [
            'pricelists' => $pricelists,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Purchasing/pricelists/form', [
            'vendors' => Contact::where('type', 'vendor')->get(['id', 'name']),
            'products' => Product::get(['id', 'name', 'code']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'product_id' => 'required|exists:products,id',
            'price' => 'required|numeric|min:0',
            'min_quantity' => 'required|numeric|min:1',
            'vendor_product_code' => 'nullable|string|max:255',
            'vendor_product_name' => 'nullable|string|max:255',
        ]);

        VendorPricelist::create($validated);

        return redirect()->route('purchasing.pricelists.index')
            ->with('success', 'Pricelist created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VendorPricelist $pricelist)
    {
        return Inertia::render('Purchasing/pricelists/form', [
            'pricelist' => $pricelist->load(['vendor', 'product']),
            'vendors' => Contact::where('type', 'vendor')->get(['id', 'name']),
            'products' => Product::get(['id', 'name', 'code']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VendorPricelist $pricelist)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'product_id' => 'required|exists:products,id',
            'price' => 'required|numeric|min:0',
            'min_quantity' => 'required|numeric|min:1',
            'vendor_product_code' => 'nullable|string|max:255',
            'vendor_product_name' => 'nullable|string|max:255',
        ]);

        $pricelist->update($validated);

        return redirect()->route('purchasing.pricelists.index')
            ->with('success', 'Pricelist updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VendorPricelist $pricelist)
    {
        $pricelist->delete();

        return redirect()->route('purchasing.pricelists.index')
            ->with('success', 'Pricelist deleted successfully.');
    }

    public function getPrice(Request $request, \App\Domain\Purchasing\Services\GetProductVendorPriceService $service)
    {
        $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|numeric|min:0',
        ]);

        $price = $service->execute(
            Product::find($request->product_id),
            $request->vendor_id,
            $request->quantity ?? 1
        );

        return response()->json(['price' => $price]);
    }
}
