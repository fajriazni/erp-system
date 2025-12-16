<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = QueryBuilder::for(Product::class)
            ->allowedFilters([
                'name',
                'code',
                'type',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%")
                            ->orWhere('code', 'like', "%{$value}%");
                    });
                }),
                AllowedFilter::exact('stock_control'),
            ])
            ->allowedSorts(['name', 'code', 'price', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/products/index', [
            'products' => $products,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/products/form', [
            'product' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:products',
            'type' => 'required|in:goods,service',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'stock_control' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        Product::create($validated);

        return redirect()->route('master.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('master/products/form', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product->id)],
            'type' => 'required|in:goods,service',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'stock_control' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $product->update($validated);

        return redirect()->route('master.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('master.products.index')->with('success', 'Product deleted successfully.');
    }
}
