<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\LandedCostService;
use App\Domain\Purchasing\Services\QualityControlService;
use App\Http\Controllers\Controller;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\LandedCost;
use App\Models\PurchaseOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GoodsReceiptController extends Controller
{
    public function __construct(
        protected \App\Domain\Purchasing\Services\CreateGoodsReceiptService $createGoodsReceiptService,
        protected LandedCostService $landedCostService,
        protected QualityControlService $qcService
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
            $po = PurchaseOrder::with(['items.product', 'items.uom', 'warehouse'])
                ->findOrFail($request->po_id);

            if ($po->status !== 'purchase_order' && $po->status !== 'locked' && $po->status !== 'partial_received') {
                // Modified logic: Allow receiving for partial_received as well
            }
        }

        return Inertia::render('Purchasing/receipts/create', [
            'purchase_orders' => PurchaseOrder::whereIn('status', ['purchase_order', 'partial_received'])
                ->whereDoesntHave('goodsReceipts', function ($query) {
                    $query->where('status', 'draft');
                })
                ->get(),
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
        $receipt->load([
            'purchaseOrder.vendor',
            'purchaseOrder.vendorBills',
            'warehouse',
            'items.product',
            'items.uom',
            'receivedBy',
            'landedCosts',
        ]);

        return Inertia::render('Purchasing/receipts/show', [
            'receipt' => $receipt,
            'qc_summary' => $this->qcService->getQcSummary($receipt->id),
        ]);
    }

    public function post(GoodsReceipt $receipt)
    {
        try {
            $this->createGoodsReceiptService->post($receipt);

            return back()->with('success', 'Goods Receipt posted and inventory updated.');
        } catch (\Exception $e) {
            Log::error('Goods Receipt Post Error: '.$e->getMessage());

            return back()->with('error', $e->getMessage());
        }
    }

    // ==================== Landed Cost Methods ====================

    public function storeLandedCost(Request $request, GoodsReceipt $receipt): RedirectResponse
    {
        if ($receipt->status === 'posted') {
            return back()->with('error', 'Cannot add landed costs to posted receipt.');
        }

        $validated = $request->validate([
            'cost_type' => 'required|string|in:freight,insurance,customs,handling,other',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'allocation_method' => 'required|string|in:by_value,by_quantity,by_weight',
        ]);

        $this->landedCostService->allocate($receipt, [$validated]);

        return back()->with('success', 'Landed cost added successfully.');
    }

    public function destroyLandedCost(GoodsReceipt $receipt, LandedCost $landedCost): RedirectResponse
    {
        if ($receipt->status === 'posted') {
            return back()->with('error', 'Cannot remove landed costs from posted receipt.');
        }

        $landedCost->delete();

        return back()->with('success', 'Landed cost removed.');
    }

    // ==================== QC Methods ====================

    public function startQc(GoodsReceipt $receipt, GoodsReceiptItem $item): RedirectResponse
    {
        if ($receipt->status !== 'posted') {
            return back()->with('error', 'Receipt must be posted before starting QC.');
        }

        try {
            $this->qcService->startInspection($item);

            return back()->with('success', 'QC inspection started.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function recordQcInspection(Request $request, GoodsReceipt $receipt, GoodsReceiptItem $item): RedirectResponse
    {
        if ($receipt->status !== 'posted') {
            return back()->with('error', 'Receipt must be posted before recording inspection.');
        }

        $validated = $request->validate([
            'passed_qty' => 'required|integer|min:0',
            'failed_qty' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $this->qcService->recordInspection(
                $item,
                (int) $validated['passed_qty'],
                (int) $validated['failed_qty'],
                Auth::user(),
                $validated['notes'] ?? null
            );

            return back()->with('success', 'Inspection recorded successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
