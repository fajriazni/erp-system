<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\CreatePurchaseReturnService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReturn;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseReturnController extends Controller
{
    public function __construct(
        protected CreatePurchaseReturnService $returnService
    ) {}

    public function index()
    {
        $returns = PurchaseReturn::with(['vendor', 'warehouse', 'purchaseOrder'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Purchasing/returns/Index', [
            'returns' => $returns,
        ]);
    }

    public function create(Request $request)
    {
        $vendors = Contact::where('type', 'vendor')->get();
        $warehouses = Warehouse::all();

        $poId = $request->query('po_id');
        $purchaseOrder = $poId ? PurchaseOrder::with(['items.product', 'vendor'])->find($poId) : null;

        return Inertia::render('Purchasing/returns/Create', [
            'vendors' => $vendors,
            'warehouses' => $warehouses,
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'vendor_id' => 'required|exists:contacts,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'return_date' => 'required|date',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.uom_id' => 'required|exists:uoms,id',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.condition' => 'nullable|string',
        ]);

        $return = $this->returnService->execute($validated);

        return redirect()->route('purchasing.returns.show', $return)
            ->with('success', 'Purchase return created successfully');
    }

    public function show(PurchaseReturn $return)
    {
        $return->load(['items.product', 'vendor', 'warehouse', 'purchaseOrder', 'debitNote']);

        return Inertia::render('Purchasing/returns/Show', [
            'return' => [
                'id' => $return->id,
                'document_number' => $return->return_number,
                'return_number' => $return->return_number,
                'date' => $return->return_date,
                'status' => $return->status,
                'amount' => $return->total_amount,
                'notes' => $return->notes,
                'reason' => $return->reason,
                'rma_number' => $return->rma_number,
                'vendor' => [
                    'id' => $return->vendor->id,
                    'name' => $return->vendor->name,
                    'email' => $return->vendor->email ?? '',
                ],
                'warehouse' => [
                    'id' => $return->warehouse->id,
                    'name' => $return->warehouse->name,
                ],
                'lines' => $return->items->map(fn($item) => [
                    'id' => $item->id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'code' => $item->product->code,
                    ],
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->subtotal,
                ]),
                'debitNote' => $return->debitNote ? [
                    'id' => $return->debitNote->id,
                    'debit_note_number' => $return->debitNote->debit_note_number,
                    'total_amount' => $return->debitNote->total_amount,
                    'status' => $return->debitNote->status,
                ] : null,
            ],
        ]);
    }

    public function edit(PurchaseReturn $return)
    {
        if ($return->status !== 'draft') {
            return redirect()->route('purchasing.returns.show', $return)
                ->with('error', 'Only draft returns can be edited');
        }

        $vendors = Contact::where('type', 'vendor')->get();
        $warehouses = Warehouse::all();

        return Inertia::render('Purchasing/returns/Edit', [
            'return' => $return->load('items.product'),
            'vendors' => $vendors,
            'warehouses' => $warehouses,
        ]);
    }

    public function update(Request $request, PurchaseReturn $return)
    {
        if ($return->status !== 'draft') {
            return redirect()->route('purchasing.returns.show', $return)
                ->with('error', 'Only draft returns can be updated');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
        ]);

        $return->update($validated);

        return redirect()->route('purchasing.returns.show', $return)
            ->with('success', 'Return updated successfully');
    }

    public function destroy(PurchaseReturn $return)
    {
        if ($return->status !== 'draft') {
            return back()->with('error', 'Only draft returns can be deleted');
        }

        $return->delete();

        return redirect()->route('purchasing.returns.index')
            ->with('success', 'Return deleted successfully');
    }

    // Additional workflow actions
    public function authorize(Request $request, PurchaseReturn $return)
    {
        $request->validate([
            'rma_number' => 'required|string|max:255',
        ]);

        $return->authorize($request->rma_number);

        return back()->with('success', 'Return authorized successfully');
    }

    public function ship(PurchaseReturn $return)
    {
        $this->returnService->ship($return);

        return back()->with('success', 'Return marked as shipped');
    }

    public function receiveByVendor(PurchaseReturn $return)
    {
        $this->returnService->receiveByVendor($return);

        return back()->with('success', 'Return received by vendor. Debit note created.');
    }

    public function complete(PurchaseReturn $return)
    {
        $return->complete();

        return back()->with('success', 'Return completed');
    }

    public function cancel(Request $request, PurchaseReturn $return)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $return->cancel($request->reason);

        return back()->with('success', 'Return cancelled');
    }
}
