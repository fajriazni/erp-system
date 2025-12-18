<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\VendorBill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorBillController extends Controller
{
    public function __construct(
        protected \App\Domain\Purchasing\Services\CreateVendorBillService $createVendorBillService,
        protected \App\Domain\Purchasing\Services\PostVendorBillService $postVendorBillService
    ) {}

    public function index(Request $request)
    {
        $query = VendorBill::with(['vendor', 'purchaseOrder'])
            ->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('bill_number', 'like', "%{$search}%")
                ->orWhere('reference_number', 'like', "%{$search}%")
                ->orWhereHas('vendor', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return Inertia::render('Accounting/VendorBills/index', [
            'bills' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        $poId = $request->query('purchase_order_id');
        $purchaseOrder = null;

        if ($poId) {
            $purchaseOrder = PurchaseOrder::with(['items.product', 'vendor'])->find($poId);
        }

        $vendorsQuery = \App\Models\Contact::whereIn('type', ['vendor', 'both']);

        if ($purchaseOrder) {
            $vendorsQuery->orWhere('id', $purchaseOrder->vendor_id);
        }

        $paymentSchedule = [];
        if ($purchaseOrder) {
            $scheduleService = app(\App\Domain\Finance\Services\PaymentScheduleService::class);
            $paymentSchedule = $scheduleService->calculateRemainingSchedule($purchaseOrder);
        }

        return Inertia::render('Accounting/VendorBills/create', [
            'purchaseOrder' => $purchaseOrder,
            'vendors' => $vendorsQuery->get(),
            'products' => \App\Models\Product::select('id', 'name', 'code')->get(),
            'paymentSchedule' => $paymentSchedule,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'nullable|exists:purchase_orders,id',
            'vendor_id' => 'required|exists:contacts,id',
            'reference_number' => 'required|string|max:255',
            'date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'withholding_tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_inclusive' => 'nullable|boolean',
        ]);

        try {
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('bills', 'public');
                $validated['attachment_path'] = $path;
            }

            // Calculate tax
            $itemsTotal = collect($validated['items'])->sum(fn ($item) => $item['quantity'] * $item['unit_price']
            );

            $taxService = app(\App\Domain\Finance\Services\TaxCalculationService::class);
            $taxCalc = $taxService->calculatePurchaseTax(
                $itemsTotal,
                $validated['tax_rate'] ?? 0,
                $validated['withholding_tax_rate'] ?? 0,
                $validated['tax_inclusive'] ?? false
            );

            $validated['subtotal'] = $taxCalc['subtotal'];
            $validated['tax_amount'] = $taxCalc['tax_amount'];
            $validated['withholding_tax_amount'] = $taxCalc['withholding_tax_amount'];
            $validated['total_amount'] = $taxCalc['total'];

            $bill = $this->createVendorBillService->execute($validated);

            return redirect()->route('accounting.bills.show', $bill->id)
                ->with('success', 'Vendor bill created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(VendorBill $bill)
    {
        $bill->load(['items.product', 'vendor', 'purchaseOrder', 'paymentLines.payment']);

        return Inertia::render('Accounting/VendorBills/show', [
            'bill' => $bill,
        ]);
    }

    public function edit(VendorBill $bill)
    {
        if ($bill->status !== 'draft') {
            return redirect()->route('accounting.bills.show', $bill->id)
                ->with('error', 'Only draft bills can be edited.');
        }

        $bill->load(['items.product', 'vendor', 'purchaseOrder.items']);

        $vendors = \App\Models\Contact::whereIn('type', ['vendor', 'both'])
            ->orWhere('id', $bill->vendor_id)
            ->get();

        $products = \App\Models\Product::select('id', 'name', 'code')->get();

        $paymentSchedule = [];
        if ($bill->purchaseOrder) {
            $scheduleService = app(\App\Domain\Finance\Services\PaymentScheduleService::class);
            // Pass current bill ID to exclude it from "billed" calculation
            $paymentSchedule = $scheduleService->calculateRemainingSchedule($bill->purchaseOrder, $bill->id);
        }

        return Inertia::render('Accounting/VendorBills/edit', [
            'bill' => $bill,
            'vendors' => $vendors,
            'products' => $products,
            'paymentSchedule' => $paymentSchedule,
        ]);
    }

    public function update(Request $request, VendorBill $bill)
    {
        if ($bill->status !== 'draft') {
            return back()->with('error', 'Only draft bills can be edited.');
        }

        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'reference_number' => 'required|string|max:255',
            'date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:vendor_bill_items,id',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'withholding_tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_inclusive' => 'nullable|boolean',
        ]);

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($request, $bill, $validated) {
                // 1. Handle File Upload
                if ($request->hasFile('attachment')) {
                    if ($bill->attachment_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($bill->attachment_path)) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($bill->attachment_path);
                    }
                    $path = $request->file('attachment')->store('bills', 'public');
                    $bill->attachment_path = $path;
                }

                // 2. Update Bill Details
                $bill->update([
                    'vendor_id' => $validated['vendor_id'],
                    'reference_number' => $validated['reference_number'],
                    'date' => $validated['date'],
                    'due_date' => $validated['due_date'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'attachment_path' => $bill->attachment_path, // Persist change if any
                ]);

                // 3. Sync Items
                $requestItemIds = collect($validated['items'])->pluck('id')->filter()->toArray();

                // Delete removed items
                $bill->items()->whereNotIn('id', $requestItemIds)->delete();

                $itemsTotal = 0;

                foreach ($validated['items'] as $itemData) {
                    $lineTotal = $itemData['quantity'] * $itemData['unit_price'];
                    $itemsTotal += $lineTotal;

                    if (isset($itemData['id']) && $itemData['id']) {
                        // Update existing item
                        $bill->items()->where('id', $itemData['id'])->update([
                            'product_id' => $itemData['product_id'] ?? null,
                            'description' => $itemData['description'],
                            'quantity' => $itemData['quantity'],
                            'unit_price' => $itemData['unit_price'],
                            'total' => $lineTotal,
                        ]);
                    } else {
                        // Create new item
                        $bill->items()->create([
                            'product_id' => $itemData['product_id'] ?? null,
                            'description' => $itemData['description'],
                            'quantity' => $itemData['quantity'],
                            'unit_price' => $itemData['unit_price'],
                            'total' => $lineTotal,
                        ]);
                    }
                }

                // 4. Calculate Tax
                $taxService = app(\App\Domain\Finance\Services\TaxCalculationService::class);

                $taxCalc = $taxService->calculatePurchaseTax(
                    $itemsTotal,
                    $validated['tax_rate'] ?? $bill->tax_rate,
                    $validated['withholding_tax_rate'] ?? $bill->withholding_tax_rate,
                    $validated['tax_inclusive'] ?? $bill->tax_inclusive
                );

                $bill->update([
                    'total_amount' => $taxCalc['total'],
                    'subtotal' => $taxCalc['subtotal'],
                    'tax_amount' => $taxCalc['tax_amount'],
                    'withholding_tax_amount' => $taxCalc['withholding_tax_amount'],
                    // Update rates if provided
                    'tax_rate' => $validated['tax_rate'] ?? $bill->tax_rate,
                    'withholding_tax_rate' => $validated['withholding_tax_rate'] ?? $bill->withholding_tax_rate,
                    'tax_inclusive' => $validated['tax_inclusive'] ?? $bill->tax_inclusive,
                ]);
            });

            return redirect()->route('accounting.bills.show', $bill->id)
                ->with('success', 'Vendor bill updated successfully.');

        } catch (\Exception $e) {
            return back()->with('error', 'Update Failed: '.$e->getMessage());
        }
    }

    public function print(VendorBill $bill)
    {
        $bill->load(['items.product', 'vendor', 'purchaseOrder']);

        return view('accounting.vendor-bills.print', [
            'bill' => $bill,
        ]);
    }

    public function post(VendorBill $bill)
    {
        try {
            $this->postVendorBillService->execute($bill);

            return back()->with('success', 'Vendor bill posted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
