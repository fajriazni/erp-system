<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PaymentTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentTermController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $terms = PaymentTerm::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Finance/PaymentTerms/index', [
            'terms' => $terms,
            'filters' => request()->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Finance/PaymentTerms/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:standard,schedule',
            'days_due' => 'required_if:type,standard|integer|min:0',
            'schedule_definition' => 'required_if:type,schedule|array',
            'is_active' => 'boolean',
        ]);

        PaymentTerm::create($validated);

        return redirect()->route('purchasing.payment-terms.index')
            ->with('success', 'Payment term created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PaymentTerm $paymentTerm)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaymentTerm $paymentTerm)
    {
        return Inertia::render('Finance/PaymentTerms/edit', [
            'term' => $paymentTerm,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentTerm $paymentTerm)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:standard,schedule',
            'days_due' => 'required_if:type,standard|integer|min:0',
            'schedule_definition' => 'required_if:type,schedule|array',
            'is_active' => 'boolean',
        ]);

        $paymentTerm->update($validated);

        return redirect()->route('purchasing.payment-terms.index')
            ->with('success', 'Payment term updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentTerm $paymentTerm)
    {
        // Check usage before delete?
        if ($paymentTerm->purchaseOrders()->exists() || $paymentTerm->contacts()->exists()) {
            return back()->with('error', 'Cannot delete payment term in use.');
        }

        $paymentTerm->delete();

        return back()->with('success', 'Payment term deleted successfully.');
    }
}
