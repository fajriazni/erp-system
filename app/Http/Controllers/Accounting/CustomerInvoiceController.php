<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CustomerInvoice::with('customer')
            ->when($request->input('filter.global'), function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('company_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->input('filter.status'), function ($q, $status) {
                $q->where('status', $status);
            })
            ->latest('date');

        return Inertia::render('Accounting/Ar/Invoices', [
            'invoices' => $query->paginate($request->input('per_page', 15))->withQueryString(),
            'filters' => $request->only(['filter', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Accounting/Ar/CreateInvoice', [
            'customers' => Contact::whereIn('type', ['customer', 'both'])->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->company_name ?? $c->name]),
            'products' => Product::select('id', 'name', 'price')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ... (validation omitted for brevity in replace tool, but keep existing)
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

        $invoice = DB::transaction(function () use ($validated) {
            $year = date('Y');
            $latest = CustomerInvoice::whereYear('created_at', $year)->max('id') ?? 0;
            $sequence = str_pad($latest + 1, 3, '0', STR_PAD_LEFT);
            $invoiceNumber = "INV/{$year}/{$sequence}";

            $invoice = CustomerInvoice::create([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'due_date' => $validated['due_date'],
                'status' => 'draft',
                'invoice_number' => $invoiceNumber,
                'subtotal' => 0,
                'tax_amount' => 0,
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

            // Calculate Tax (11% VAT standard in Indonesia/Region)
            $taxRate = 0.11;
            $taxAmount = $subtotal * $taxRate;
            $totalAmount = $subtotal + $taxAmount;

            $invoice->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
            ]);

            return $invoice;
        });

        return redirect()->route('accounting.ar.invoices.show', $invoice)->with('success', 'Invoice created successfully.');
    }

    public function show(CustomerInvoice $invoice)
    {
        return Inertia::render('Accounting/Ar/ShowInvoice', [
            'invoice' => $invoice->load(['customer', 'lines', 'lines.product']),
            'canPost' => $invoice->status === 'draft',
        ]);
    }

    public function edit(CustomerInvoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return redirect()->route('accounting.ar.invoices.show', $invoice)->with('error', 'Only draft invoices can be edited.');
        }

        return Inertia::render('Accounting/Ar/EditInvoice', [
            'invoice' => $invoice->load(['lines']),
            'customers' => Contact::whereIn('type', ['customer', 'both'])->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->company_name ?? $c->name]),
            'products' => Product::select('id', 'name', 'price')->get(),
        ]);
    }

    public function update(Request $request, CustomerInvoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be updated.');
        }

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

        DB::transaction(function () use ($validated, $invoice) {
            $invoice->update([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'due_date' => $validated['due_date'],
            ]);

            // Clear existing lines to replace (simplest approach)
            $invoice->lines()->delete();

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

            // Calculate Tax (11% VAT)
            $taxRate = 0.11;
            $taxAmount = $subtotal * $taxRate;
            $totalAmount = $subtotal + $taxAmount;

            $invoice->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
            ]);
        });

        return redirect()->route('accounting.ar.invoices.show', $invoice)->with('success', 'Invoice updated successfully.');
    }

    public function destroy(CustomerInvoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be deleted.');
        }

        $invoice->lines()->delete();
        $invoice->delete();

        return redirect()->route('accounting.ar.invoices.index')->with('success', 'Invoice deleted successfully.');
    }

    public function post(CustomerInvoice $invoice, \App\Domain\Sales\Services\PostCustomerInvoiceService $postService)
    {
        try {
            $postService->execute($invoice, auth()->user());

            return redirect()->route('accounting.ar.invoices.show', $invoice)->with('success', 'Invoice posted successfully. Journal Entry created.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to post invoice: '.$e->getMessage());
        }
    }
}
