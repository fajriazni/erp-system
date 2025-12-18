<?php

namespace App\Http\Controllers\Sales\Operations;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PriceListController extends Controller
{
    public function index(Request $request)
    {
        $query = PriceList::withCount('items')->latest();

        return Inertia::render('Sales/Operations/PriceLists/Index', [
            'priceLists' => $query->paginate(20),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Operations/PriceLists/Create', [
            'products' => Product::where('is_sold', true)->select('id', 'name', 'code', 'price')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'currency' => 'required|string|size:3',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'items' => 'array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.min_quantity' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $priceList = PriceList::create([
                'name' => $validated['name'],
                'currency' => $validated['currency'],
                'is_active' => $validated['is_active'] ?? true,
                'description' => $validated['description'],
            ]);

            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $priceList->items()->create([
                        'product_id' => $item['product_id'],
                        'price' => $item['price'],
                        'min_quantity' => $item['min_quantity'] ?? 0,
                    ]);
                }
            }
        });

        return redirect()->route('sales.price-lists.index')->with('success', 'Price list created successfully.');
    }

    public function show(PriceList $priceList)
    {
         $priceList->load('items.product');
         return Inertia::render('Sales/Operations/PriceLists/Show', [
            'priceList' => $priceList
         ]);
    }
}
