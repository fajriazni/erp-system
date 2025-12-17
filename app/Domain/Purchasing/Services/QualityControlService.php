<?php

namespace App\Domain\Purchasing\Services;

use App\Models\GoodsReceiptItem;
use App\Models\PurchaseReturn;
use App\Models\QcInspection;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class QualityControlService
{
    /**
     * Start QC inspection for a GR item.
     */
    public function startInspection(GoodsReceiptItem $item): void
    {
        if ($item->qc_status !== 'pending') {
            throw new Exception('Item is not pending QC.');
        }

        $item->update(['qc_status' => 'in_qa']);
    }

    /**
     * Record inspection results for a GR item.
     */
    public function recordInspection(
        GoodsReceiptItem $item,
        int $passedQty,
        int $failedQty,
        User $inspector,
        ?string $notes = null,
        ?array $checklistResults = null
    ): QcInspection {
        $totalQty = $passedQty + $failedQty;
        $receivedQty = $item->quantity_received ?? 0;

        if ($totalQty > $receivedQty) {
            throw new Exception("Inspected qty ({$totalQty}) cannot exceed received qty ({$receivedQty}).");
        }

        return DB::transaction(function () use ($item, $passedQty, $failedQty, $inspector, $notes, $checklistResults, $receivedQty) {
            // Create inspection record
            $inspection = QcInspection::create([
                'goods_receipt_item_id' => $item->id,
                'inspector_id' => $inspector->id,
                'passed_qty' => $passedQty,
                'failed_qty' => $failedQty,
                'notes' => $notes,
                'checklist_results' => $checklistResults,
            ]);

            // Update item's QC totals
            $newPassedQty = ($item->qc_passed_qty ?? 0) + $passedQty;
            $newFailedQty = ($item->qc_failed_qty ?? 0) + $failedQty;
            $totalInspected = $newPassedQty + $newFailedQty;

            // Determine new status
            $qcStatus = 'in_qa';
            if ($totalInspected >= $receivedQty) {
                if ($newFailedQty === 0) {
                    $qcStatus = 'passed';
                } elseif ($newPassedQty === 0) {
                    $qcStatus = 'failed';
                } else {
                    $qcStatus = 'partial';
                }
            }

            $item->update([
                'qc_status' => $qcStatus,
                'qc_passed_qty' => $newPassedQty,
                'qc_failed_qty' => $newFailedQty,
                'qc_notes' => $notes,
                'qc_by' => $inspector->id,
                'qc_at' => now(),
            ]);

            return $inspection;
        });
    }

    /**
     * Create a purchase return for failed items.
     */
    public function createReturnForFailed(GoodsReceiptItem $item): ?PurchaseReturn
    {
        if ($item->qc_failed_qty <= 0) {
            return null;
        }

        $gr = $item->goodsReceipt;

        // Create return using the existing return service or directly
        $return = PurchaseReturn::create([
            'return_number' => 'RET-QC-'.now()->format('YmdHis'),
            'goods_receipt_id' => $gr->id,
            'purchase_order_id' => $gr->purchase_order_id,
            'vendor_id' => $gr->vendor_id,
            'warehouse_id' => $gr->warehouse_id,
            'reason' => 'QC Failed: '.($item->qc_notes ?? 'Quality inspection failed'),
            'status' => 'draft',
            'return_date' => now(),
        ]);

        // Create return item
        $return->items()->create([
            'goods_receipt_item_id' => $item->id,
            'product_id' => $item->product_id,
            'quantity' => $item->qc_failed_qty,
            'reason' => $item->qc_notes ?? 'QC Failed',
        ]);

        return $return;
    }

    /**
     * Get QC summary statistics for a goods receipt.
     */
    public function getQcSummary(int $goodsReceiptId): array
    {
        $items = GoodsReceiptItem::where('goods_receipt_id', $goodsReceiptId)->get();

        $totalQty = $items->sum('quantity_received');
        $passedQty = $items->sum('qc_passed_qty');
        $failedQty = $items->sum('qc_failed_qty');
        $pendingQty = $totalQty - $passedQty - $failedQty;

        return [
            'total_qty' => $totalQty,
            'passed_qty' => $passedQty,
            'failed_qty' => $failedQty,
            'pending_qty' => $pendingQty,
            'pass_rate' => $totalQty > 0 ? round(($passedQty / $totalQty) * 100, 2) : 0,
            'items_by_status' => [
                'pending' => $items->where('qc_status', 'pending')->count(),
                'in_qa' => $items->where('qc_status', 'in_qa')->count(),
                'passed' => $items->where('qc_status', 'passed')->count(),
                'failed' => $items->where('qc_status', 'failed')->count(),
                'partial' => $items->where('qc_status', 'partial')->count(),
            ],
        ];
    }
}
