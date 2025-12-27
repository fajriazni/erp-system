<?php

namespace App\Http\Controllers\Accounting;

use App\Domain\Sales\Services\PostCustomerPaymentService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\CustomerInvoice;
use App\Models\CustomerPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerPaymentController extends Controller
{
    public function index()
    {
        return Inertia::render('Accounting/Ar/Payments/Index', [
            'payments' => CustomerPayment::with('customer')
                ->latest()
                ->paginate(20),
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounting/Ar/Payments/Create', [
            'customers' => Contact::whereIn('type', ['customer', 'both'])->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->company_name ?? $c->name,
            ]),
            // We might want to load open invoices here or via an API endpoint.
            // For now, let's load ALL open invoices to filter on frontend (Not scalable but works for MVP)
            // Ideally, fetch via XHR when customer is selected.
            'openInvoices' => CustomerInvoice::whereIn('status', ['posted', 'partial', 'sent'])
                ->with('customer')
                ->get()
                ->map(fn ($i) => [
                    'id' => $i->id,
                    'customer_id' => $i->customer_id,
                    'invoice_number' => $i->invoice_number,
                    'total_amount' => $i->total_amount,
                    // 'amount_due' => ... (calculate this properly)
                    'date' => $i->date,
                ]),
            'prefill' => [
                'customer_id' => request('customer_id'),
                'invoice_id' => request('invoice_id'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:contacts,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.invoice_id' => 'required|exists:customer_invoices,id',
            'lines.*.amount' => 'required|numeric|min:0.01',
        ]);

        $payment = DB::transaction(function () use ($validated) {
            $payment = CustomerPayment::create([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'amount' => $validated['amount'],
                'reference' => $validated['reference'] ?? null,
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'draft',
                'payment_number' => 'PAY-'.date('Ymd').'-'.rand(1000, 9999),
            ]);

            foreach ($validated['lines'] as $line) {
                $payment->lines()->create([
                    'customer_invoice_id' => $line['invoice_id'],
                    'amount' => $line['amount'],
                ]);
            }

            return $payment;
        });

        return redirect()->route('accounting.ar.payments.show', $payment)->with('success', 'Payment recorded successfully.');
    }

    public function show(CustomerPayment $payment)
    {
        return Inertia::render('Accounting/Ar/Payments/Show', [
            'payment' => $payment->load(['customer', 'lines.invoice', 'journalEntry']),
        ]);
    }

    public function post(CustomerPayment $payment, PostCustomerPaymentService $service)
    {
        try {
            $service->execute($payment, auth()->user());

            return redirect()->route('accounting.ar.payments.show', $payment)->with('success', 'Payment posted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to post payment: '.$e->getMessage());
        }
    }
}
