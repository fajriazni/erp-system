<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\Warehouse;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GoodsReceiptController extends Controller
{
    public function __construct(
        protected \App\Domain\Purchasing\Services\CreateGoodsReceiptService $createGoodsReceiptService
    ) {}

    public function index()
    {
        $receipts = GoodsReceipt::with(['purchaseOrder', 'warehouse', 'receivedBy'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Purchasing/receipts/index', [
            'receipts' => $receipts,
        ]);
    }

    public function create(Request $request)
    {
        // If PO ID provided, load it
        $po = null;
        if ($request->has('po_id')) {
            $po = PurchaseOrder::with(['items.product', 'items.uom'])
                ->findOrFail($request->po_id);
            
            if ($po->status !== 'purchase_order' && $po->status !== 'locked' && $po->status !== 'partial_received') {
               // Modified logic: Allow receiving for partial_received as well
            }
        }

        return Inertia::render('Purchasing/receipts/create', [
            'purchase_orders' => PurchaseOrder::whereIn('status', ['purchase_order', 'partial_received'])->get(),
            'initial_po' => $po,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'date' => 'required|date',
            'receipt_number' => 'required|string|unique:goods_receipts,receipt_number',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.uom_id' => 'required|exists:uoms,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.notes' => 'nullable|string',
        ]);

        try {
            $this->createGoodsReceiptService->execute($validated);
            return redirect()->route('purchasing.receipts.index')->with('success', 'Goods Receipt created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(GoodsReceipt $receipt)
    {
        $receipt->load(['purchaseOrder', 'warehouse', 'items.product', 'items.uom', 'receivedBy']);
        return Inertia::render('Purchasing/receipts/show', [
            'receipt' => $receipt,
        ]);
    }

    public function post(GoodsReceipt $receipt)
    {
        try {
            $this->createGoodsReceiptService->post($receipt);
            return back()->with('success', 'Goods Receipt posted and inventory updated.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
