<?php

namespace App\Http\Controllers\Purchasing;

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

        return Inertia::render('Purchasing/bills/index', [
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

        return Inertia::render('Purchasing/bills/create', [
            'purchaseOrder' => $purchaseOrder,
            'vendors' => $vendorsQuery->get(),
            'products' => \App\Models\Product::select('id', 'name', 'code')->get(),
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
        ]);

        try {
            $bill = $this->createVendorBillService->execute($validated);

            return redirect()->route('purchasing.bills.show', $bill->id)
                ->with('success', 'Vendor bill created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(VendorBill $bill)
    {
        $bill->load(['items.product', 'vendor', 'purchaseOrder']);

        return Inertia::render('Purchasing/bills/show', [
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
