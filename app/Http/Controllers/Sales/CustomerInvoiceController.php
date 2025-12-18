<?php

namespace App\Http\Controllers\Sales;

use App\Domain\Sales\Services\CreateCustomerInvoiceService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerInvoiceController extends Controller
{
    public function __construct(
        protected CreateCustomerInvoiceService $createService
    ) {}

    public function index()
    {
        return Inertia::render('Sales/Invoices/Index', [
            'invoices' => CustomerInvoice::with('customer')
                ->latest()
                ->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Invoices/Create', [
            'customers' => Contact::whereIn('type', ['customer', 'both'])->get(),
            'products' => Product::select('id', 'name', 'code', 'price')->get(), // Assuming price column exists
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:contacts,id',
            'date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'invoice_number' => 'required|string|unique:customer_invoices,invoice_number',
            'reference_number' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'tax_inclusive' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $this->createService->execute($validated);

        return redirect()->route('sales.invoices.index')->with('success', 'Invoice created successfully.');
    }

    public function show(CustomerInvoice $invoice)
    {
        $invoice->load(['lines.product', 'customer']);

        return Inertia::render('Sales/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function post(CustomerInvoice $invoice)
    {
        try {
            $this->createService->post($invoice);

            return back()->with('success', 'Invoice posted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
