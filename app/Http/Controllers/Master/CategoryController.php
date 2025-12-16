<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = QueryBuilder::for(Category::class)
            ->allowedFilters([
                'name',
                'type',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where('name', 'like', "%{$value}%");
                }),
            ])
            ->allowedSorts(['name', 'type', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/categories/form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:product,contact',
        ]);

        Category::create($validated);

        return redirect()->route('master.categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(Category $category)
    {
        return Inertia::render('master/categories/form', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:product,contact',
        ]);

        $category->update($validated);

        return redirect()->route('master.categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('master.categories.index')->with('success', 'Category deleted successfully.');
    }
}
