<?php

namespace App\Http\Controllers\Sales;

use App\Domain\Sales\Services\ReceiveCustomerPaymentService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\CustomerPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerPaymentController extends Controller
{
    public function __construct(
        protected ReceiveCustomerPaymentService $receiveService
    ) {}

    public function index()
    {
        return Inertia::render('Sales/Payments/Index', [
            'payments' => CustomerPayment::with('customer')->latest()->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Payments/Create', [
            'customers' => Contact::whereIn('type', ['customer', 'both'])->get(),
            // In a real app, we would fetch open invoices via API when customer is selected
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:contacts,id',
            'payment_number' => 'required|string|unique:customer_payments,payment_number',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'reference' => 'nullable|string',
            'allocations' => 'required|array|min:1',
            'allocations.*.invoice_id' => 'required|exists:customer_invoices,id',
            'allocations.*.amount' => 'required|numeric|min:0.01',
        ]);

        $this->receiveService->execute($validated);

        return redirect()->route('sales.payments.index')->with('success', 'Payment received successfully.');
    }
}
