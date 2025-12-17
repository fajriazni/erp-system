<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\CreatePurchaseReturnService;
use App\Domain\Purchasing\Services\PostPurchaseReturnService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseReturn;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseReturnController extends Controller
{
    public function __construct(
        protected CreatePurchaseReturnService $createPurchaseReturnService,
        protected PostPurchaseReturnService $postPurchaseReturnService
    ) {}

    public function index()
    {
        $returns = PurchaseReturn::with('vendor')
            ->orderBy('date', 'desc')
            ->paginate(10);

        return Inertia::render('Purchasing/returns/index', [
            'returns' => $returns,
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/returns/create', [
            'vendors' => Contact::where('type', 'vendor')->orWhere('type', 'both')->orderBy('name')->get(),
            'products' => Product::orderBy('name')->select('id', 'name', 'code', 'price', 'cost')->get(),
            'warehouses' => \App\Models\Warehouse::orderBy('name')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            $this->createPurchaseReturnService->execute($validated);

            return redirect()->route('purchasing.returns.index')->with('success', 'Purchase Return created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(PurchaseReturn $return)
    {
        $return->load(['vendor', 'lines.product']);

        return Inertia::render('Purchasing/returns/show', [
            'return' => $return,
        ]);
    }

    public function post(PurchaseReturn $return)
    {
        try {
            $this->postPurchaseReturnService->execute($return);

            return back()->with('success', 'Purchase Return posted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
