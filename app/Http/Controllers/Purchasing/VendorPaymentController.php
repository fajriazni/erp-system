<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Finance\Services\CreateVendorPaymentService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\VendorBill;
use App\Models\VendorPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorPaymentController extends Controller
{
    public function __construct(
        protected CreateVendorPaymentService $createVendorPaymentService
    ) {}

    public function index()
    {
        $payments = VendorPayment::with('vendor')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Purchasing/payments/index', [
            'payments' => $payments,
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/payments/create', [
            'vendors' => Contact::whereIn('type', ['vendor', 'both'])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
            'allocations' => 'required|array|min:1',
            'allocations.*.bill_id' => 'required|exists:vendor_bills,id',
            'allocations.*.amount' => 'required|numeric|min:0.01',
        ]);

        // Auto-generate Payment Number
        $latest = VendorPayment::latest()->first();
        $sequence = $latest ? intval(substr($latest->payment_number, -4)) + 1 : 1;
        $validated['payment_number'] = 'PAY-'.date('Ym').'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);

        try {
            $this->createVendorPaymentService->execute($validated);

            return redirect()->route('purchasing.payments.index')->with('success', 'Payment recorded successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(VendorPayment $payment)
    {
        $payment->load(['vendor', 'lines.bill']);

        return Inertia::render('Purchasing/payments/show', [
            'payment' => $payment,
        ]);
    }

    public function edit(VendorPayment $payment)
    {
        $payment->load(['vendor', 'lines.bill']);

        return Inertia::render('Purchasing/payments/edit', [
            'payment' => $payment,
            'vendors' => Contact::whereIn('type', ['vendor', 'both'])->get(),
        ]);
    }

    public function update(Request $request, VendorPayment $payment)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment_method' => 'required|string',
            // Amount and allocations are tricky to update after posting without full reversal logic.
            // keeping them immutable for now or until UpdateService is available.
        ]);

        $payment->update($validated);

        return redirect()->route('purchasing.payments.index')->with('success', 'Payment updated successfully.');
    }

    public function getUnpaidBills(Contact $vendor)
    {
        $bills = VendorBill::where('vendor_id', $vendor->id)
            ->whereIn('status', ['posted', 'partial'])
            ->get()
            // Filter in PHP or use SQL calculation for balance due
            ->filter(function ($bill) {
                return $bill->balance_due > 0;
            })
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'bill_number' => $bill->bill_number,
                    'date' => $bill->date->format('Y-m-d'),
                    'due_date' => $bill->due_date->format('Y-m-d'),
                    'total_amount' => $bill->total_amount,
                    'amount_paid' => $bill->amount_paid,
                    'balance_due' => $bill->balance_due,
                ];
            })
            ->values();

        return response()->json($bills);
    }
}
