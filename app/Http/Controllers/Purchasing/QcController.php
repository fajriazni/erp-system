<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceiptItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QcController extends Controller
{
    public function index(Request $request)
    {
        // Note: Assuming QC data is stored in goods_receipt_items table
        // with qc_status, qty_passed, qty_failed fields
        $query = GoodsReceiptItem::with([
            'goodsReceipt.purchaseOrder.vendor',
            'product',
        ])
        ->whereHas('goodsReceipt', function ($q) {
            $q->where('status', 'posted');
        })
        ->latest();

        // Search
        if ($request->has('filter.global') && $request->input('filter.global') !== '') {
            $search = $request->input('filter.global');
            $query->where(function ($q) use ($search) {
                $q->whereHas('goodsReceipt', function ($q) use ($search) {
                    $q->where('receipt_number', 'like', "%{$search}%");
                })
                ->orWhereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            });
        }

        // Filter by status (assuming qc_status field exists)
        if ($request->has('filter.status') && $request->input('filter.status') !== '') {
            $query->where('qc_status', $request->input('filter.status'));
        }

        // Transform data to match frontend interface
        $items = $query->paginate($request->input('per_page', 15))->withQueryString();
        
        $inspections = [
            'data' => $items->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'goods_receipt_item' => [
                        'id' => $item->id,
                        'goods_receipt' => [
                            'receipt_number' => $item->goodsReceipt->receipt_number,
                            'purchase_order' => [
                                'document_number' => $item->goodsReceipt->purchaseOrder->document_number,
                                'vendor' => [
                                    'name' => $item->goodsReceipt->purchaseOrder->vendor->name,
                                ],
                            ],
                        ],
                        'product' => [
                            'name' => $item->product->name,
                            'sku' => $item->product->code,
                        ],
                        'quantity_received' => $item->quantity_received,
                    ],
                    'qty_inspected' => $item->qty_inspected ?? 0,
                    'qty_passed' => $item->qty_passed ?? 0,
                    'qty_failed' => $item->qty_failed ?? 0,
                    'status' => $item->qc_status ?? 'pending',
                    'inspector' => $item->inspectedBy ? ['name' => $item->inspectedBy->name] : null,
                    'inspection_date' => $item->inspection_date,
                    'created_at' => $item->created_at,
                ];
            })->toArray(),
            'current_page' => $items->currentPage(),
            'links' => $items->linkCollection()->toArray(),
            'from' => $items->firstItem(),
            'to' => $items->lastItem(),
            'total' => $items->total(),
            'per_page' => $items->perPage(),
        ];

        // Statistics
        $totalInspected = GoodsReceiptItem::whereNotNull('qty_inspected')->count();
        $stats = [
            'pending' => GoodsReceiptItem::where('qc_status', 'pending')->count(),
            'in_progress' => GoodsReceiptItem::where('qc_status', 'in_progress')->count(),
            'completed' => GoodsReceiptItem::where('qc_status', 'completed')->count(),
            'pass_rate' => $totalInspected > 0
                ? (GoodsReceiptItem::whereNotNull('qty_passed')->sum('qty_passed') / 
                   GoodsReceiptItem::whereNotNull('qty_inspected')->sum('qty_inspected')) * 100
                : 0,
        ];

        return Inertia::render('Purchasing/Operations/Qc', [
            'inspections' => $inspections,
            'stats' => $stats,
            'filters' => $request->only(['filter', 'per_page']),
        ]);
    }

    public function show(GoodsReceiptItem $item)
    {
        $item->load([
            'goodsReceipt.purchaseOrder.vendor',
            'product',
            'inspectedBy',
        ]);

        return Inertia::render('Purchasing/Operations/QcDetail', [
            'item' => $item,
        ]);
    }

    public function record(Request $request, GoodsReceiptItem $item)
    {
        $validated = $request->validate([
            'qty_passed' => 'required|integer|min:0',
            'qty_failed' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $item->update([
                'qty_inspected' => $validated['qty_passed'] + $validated['qty_failed'],
                'qty_passed' => $validated['qty_passed'],
                'qty_failed' => $validated['qty_failed'],
                'qc_status' => 'completed',
                'qc_notes' => $validated['notes'] ?? null,
                'inspected_by' => auth()->id(),
                'inspection_date' => now(),
            ]);

            return back()->with('success', 'QC inspection recorded successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
