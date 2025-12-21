<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceiptItem;
use Illuminate\Http\Request;
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
                    'qty_inspected' => ($item->qc_passed_qty ?? 0) + ($item->qc_failed_qty ?? 0),
                    'qty_passed' => $item->qc_passed_qty ?? 0,
                    'qty_failed' => $item->qc_failed_qty ?? 0,
                    'status' => $item->qc_status ?? 'pending',
                    'inspector' => $item->qcBy ? ['name' => $item->qcBy->name] : null,
                    'inspection_date' => $item->qc_at,
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
        $totalPassed = GoodsReceiptItem::whereNotNull('qc_passed_qty')->sum('qc_passed_qty');
        $totalFailed = GoodsReceiptItem::whereNotNull('qc_failed_qty')->sum('qc_failed_qty');
        $totalInspected = $totalPassed + $totalFailed;

        $stats = [
            'pending' => GoodsReceiptItem::where('qc_status', 'pending')->count(),
            'in_progress' => GoodsReceiptItem::where('qc_status', 'in_qa')->count(),
            'completed' => GoodsReceiptItem::whereIn('qc_status', ['passed', 'failed', 'partial'])->count(),
            'pass_rate' => $totalInspected > 0
                ? ($totalPassed / $totalInspected) * 100
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
            'qcBy',
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
            // Use the model method for proper QC recording
            $item->recordQc(
                $validated['qty_passed'],
                $validated['qty_failed'],
                auth()->user(),
                $validated['notes'] ?? null
            );

            return back()->with('success', 'QC inspection recorded successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
