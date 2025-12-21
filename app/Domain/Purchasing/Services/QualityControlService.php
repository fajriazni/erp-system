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
        ?array $checklistResults = null,
        bool $autoCreateReturn = true
    ): QcInspection {
        $totalNewInspected = $passedQty + $failedQty;
        $receivedQty = $item->quantity_received ?? 0;
        $alreadyInspected = ($item->qc_passed_qty ?? 0) + ($item->qc_failed_qty ?? 0);
        $remainingQty = $receivedQty - $alreadyInspected;

        if ($totalNewInspected > $remainingQty) {
            throw new Exception("Inspected qty ({$totalNewInspected}) cannot exceed remaining qty ({$remainingQty}).");
        }

        if ($passedQty < 0 || $failedQty < 0) {
            throw new Exception('Passed and failed quantities must be non-negative.');
        }

        return DB::transaction(function () use ($item, $passedQty, $failedQty, $inspector, $notes, $checklistResults, $receivedQty, $autoCreateReturn) {
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

            // Auto-create return for failed items if inspection is complete
            if ($autoCreateReturn && $failedQty > 0 && $totalInspected >= $receivedQty) {
                $this->createReturnForFailed($item);
            }

            // Record Vendor Quality Performance
            $receipt = $item->goodsReceipt;
            if ($receipt && $totalInspected >= $receivedQty) {
                // Only record once inspection is complete
                app(\App\Domain\Purchasing\Services\VendorScorecardService::class)
                    ->recordQualityPerformance($receipt, $newPassedQty, $newFailedQty);
            }

            // Dispatch Event
            event(new \App\Domain\Purchasing\Events\QualityInspectionCompleted($item, $passedQty, $failedQty, $notes));

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
     * Batch inspect multiple items at once.
     */
    public function batchInspect(array $inspections, User $inspector): array
    {
        $results = [];

        DB::transaction(function () use ($inspections, $inspector, &$results) {
            foreach ($inspections as $inspection) {
                $item = GoodsReceiptItem::findOrFail($inspection['item_id']);

                $result = $this->recordInspection(
                    $item,
                    $inspection['passed_qty'] ?? 0,
                    $inspection['failed_qty'] ?? 0,
                    $inspector,
                    $inspection['notes'] ?? null,
                    $inspection['checklist_results'] ?? null,
                    $inspection['auto_create_return'] ?? true
                );

                $results[] = [
                    'item_id' => $item->id,
                    'inspection_id' => $result->id,
                    'qc_status' => $item->fresh()->qc_status,
                ];
            }
        });

        return $results;
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
