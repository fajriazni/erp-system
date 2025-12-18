<?php

namespace App\Http\Controllers\Sales;

use App\Domain\Sales\Services\OrderService;
use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesOrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index()
    {
        return Inertia::render('Sales/Orders/Index', [
            'orders' => SalesOrder::with(['customer', 'warehouse'])->latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Orders/Create', [
            'customers' => \App\Models\Contact::where('type', 'customer')->get(),
            'warehouses' => \App\Models\Warehouse::all(),
            'products' => \App\Models\Product::select('id', 'name', 'code', 'sales_price')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:contacts,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $order = $this->orderService->createOrder($validated);

        return redirect()->route('sales.orders.show', $order);
    }

    public function show(SalesOrder $order)
    {
        return Inertia::render('Sales/Orders/Show', [
            'order' => $order->load(['customer', 'items.product', 'warehouse']),
        ]);
    }
}
