<?php

namespace App\Http\Controllers\Sales\Operations;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use App\Models\Contact;
use App\Models\Warehouse;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class QuotationController extends Controller
{
    public function index()
    {
        return Inertia::render('Sales/Operations/Quotations/Index', [
            'quotations' => SalesOrder::with(['customer', 'warehouse'])
                ->whereIn('status', ['draft', 'sent'])
                ->latest()
                ->paginate(20)
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Operations/Quotations/Create', [
            'customers' => Contact::where('is_customer', true)->get(),
            'warehouses' => Warehouse::all(),
            'products' => Product::where('is_sold', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
         $validated = $request->validate([
            'customer_id' => 'required|exists:contacts,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'date' => 'required|date',
            'lines' => 'required|array|min:1',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.quantity' => 'required|numeric|min:0.01',
            'lines.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $order = SalesOrder::create([
                'customer_id' => $validated['customer_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'date' => $validated['date'],
                'status' => 'draft', // Quotation start as draft
                'document_number' => 'SQ-' . date('Ymd') . '-' . rand(1000, 9999), 
                'subtotal' => 0,
                'total' => 0,
            ]);

            $subtotal = 0;

            foreach ($validated['lines'] as $line) {
                $lineSubtotal = $line['quantity'] * $line['unit_price'];
                $subtotal += $lineSubtotal;

                $order->items()->create([
                    'product_id' => $line['product_id'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'subtotal' => $lineSubtotal,
                    'tax_amount' => 0, // Simplified tax
                ]);
            }

             $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);
        });

        return redirect()->route('sales.quotations.index')->with('success', 'Quotation created successfully.');
    }
}
