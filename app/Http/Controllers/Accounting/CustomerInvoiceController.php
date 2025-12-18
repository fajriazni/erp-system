<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\CustomerInvoice;
use App\Models\Contact;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CustomerInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Accounting/Ar/Invoices', [
             'invoices' => CustomerInvoice::with('customer')
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Accounting/Ar/CreateInvoice', [
            'customers' => Contact::where('is_customer', true)->get()->map(fn($c) => ['id' => $c->id, 'name' => $c->company_name ?? $c->name]),
            'products' => Product::where('is_sold', true)->select('id', 'name', 'price')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:contacts,id',
            'date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'lines' => 'required|array|min:1',
            'lines.*.product_id' => 'nullable|exists:products,id',
            'lines.*.description' => 'required|string',
            'lines.*.quantity' => 'required|numeric|min:0.01',
            'lines.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $invoice = CustomerInvoice::create([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'due_date' => $validated['due_date'],
                'status' => 'draft',
                'invoice_number' => 'INV-' . date('Ymd') . '-' . rand(1000, 9999), // Simple generator
                'subtotal' => 0,
                'total_amount' => 0,
            ]);

            $subtotal = 0;

            foreach ($validated['lines'] as $line) {
                $lineSubtotal = $line['quantity'] * $line['unit_price'];
                $subtotal += $lineSubtotal;

                $invoice->lines()->create([
                    'product_id' => $line['product_id'] ?? null,
                    'description' => $line['description'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'subtotal' => $lineSubtotal,
                ]);
            }

            $invoice->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal, // Tax handling omitted for brevity
            ]);
        });

        return redirect()->route('accounting.ar.invoices')->with('success', 'Invoice created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CustomerInvoice $customerInvoice)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CustomerInvoice $customerInvoice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CustomerInvoice $customerInvoice)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CustomerInvoice $customerInvoice)
    {
        //
    }
}
