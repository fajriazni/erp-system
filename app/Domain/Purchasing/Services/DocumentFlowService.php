<?php

namespace App\Domain\Purchasing\Services;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRfq;
use App\Models\VendorBill;
use App\Models\VendorQuotation;

class DocumentFlowService
{
    public function getChain(string $startType, int $startId): array
    {
        // 1. Identify the root PR (if any) or the earliest ancestor
        // Strategy: Find the "Central Intent" usually the PR or PO.
        // If we start at Bill, go up to PO.
        // If we start at GR, go up to PO.
        // If we start at Quote, go up to RFQ -> PR.
        
        $rootPr = null;
        $rootRfq = null;
        $originPo = null;

        // Traverse Upwards
        if ($startType === 'bill') {
            $bill = VendorBill::findOrFail($startId);
            $originPo = $bill->purchaseOrder;
        } elseif ($startType === 'gr') {
            $gr = GoodsReceipt::findOrFail($startId);
            $originPo = $gr->purchaseOrder;
        } elseif ($startType === 'po') {
            $originPo = PurchaseOrder::findOrFail($startId);
        } elseif ($startType === 'quote') {
            $quote = VendorQuotation::with('rfq')->findOrFail($startId);
            $rootRfq = $quote->rfq;
            if ($quote->purchase_order_id) {
                $originPo = PurchaseOrder::find($quote->purchase_order_id);
            }
        } elseif ($startType === 'rfq') {
            $rootRfq = PurchaseRfq::findOrFail($startId);
        } elseif ($startType === 'pr') {
            $rootPr = PurchaseRequest::findOrFail($startId);
        }

        // If we found a PO, check if it came from PR or Quote
        if ($originPo) {
            // Check for Quote link (Reverse lookup)
            $quote = VendorQuotation::where('purchase_order_id', $originPo->id)->first();
            if ($quote) {
                $rootRfq = $quote->rfq; // Go up to RFQ
            }

            // Check for PR link (Direct or via RFQ)
            if ($originPo->purchase_request_id) {
                $rootPr = PurchaseRequest::find($originPo->purchase_request_id);
            }
            if ($rootRfq && $rootRfq->purchase_request_id) {
                $rootPr = PurchaseRequest::find($rootRfq->purchase_request_id);
            }
        }

        // If we found an RFQ but no PR yet, check RFQ's PR
        if ($rootRfq && !$rootPr && $rootRfq->purchase_request_id) {
            $rootPr = PurchaseRequest::find($rootRfq->purchase_request_id);
        }

        // Now we have the "Highest Known Ancestor" (PR, RFQ, or PO).
        // We will build the tree downwards from there.

        $nodes = [];
        $edges = [];

        // START BUILDING FROM ROOT PR
        if ($rootPr) {
            $this->addNode($nodes, 'pr', $rootPr->id, $rootPr->document_number, $rootPr->status);
            
            // PR Children: Direct POs
            foreach ($rootPr->purchaseOrders as $po) {
                // If PO is linked to a Quote, we handle it under RFQ branch broadly,
                // BUT if it's a direct conversion, we show edge PR->PO.
                // How to distinguish? If PO has ANY quote linked, it comes from Quote?
                // Or if it strictly matches logic.
                // Let's draw edge PR->PO. If that PO is ALSO linked to Quote, we might have 2 incoming edges (Merge)?
                // That's acceptable.
                
                $this->processPoBranch($po, $nodes, $edges, 'pr', $rootPr->id);
            }

            // PR Children: RFQs
            // Assuming Relation purchaseRfqs exists on PR model?
             $rfqs = PurchaseRfq::where('purchase_request_id', $rootPr->id)->get();
             foreach ($rfqs as $rfq) {
                 $this->processRfqBranch($rfq, $nodes, $edges, 'pr', $rootPr->id);
             }
        } 
        elseif ($rootRfq) {
            // No PR, start at RFQ
            $this->processRfqBranch($rootRfq, $nodes, $edges, null, null);
        }
        elseif ($originPo) {
            // No PR, No RFQ, start at PO
            $this->processPoBranch($originPo, $nodes, $edges, null, null);
        }

        return [
            'nodes' => array_values($nodes),
            'edges' => $edges
        ];
    }

    private function processRfqBranch(PurchaseRfq $rfq, &$nodes, &$edges, $parentIdType, $parentId)
    {
        $this->addNode($nodes, 'rfq', $rfq->id, $rfq->document_number, $rfq->status);
        if ($parentId) {
            $edges[] = ['source' => "{$parentIdType}-{$parentId}", 'target' => "rfq-{$rfq->id}"];
        }

        foreach ($rfq->quotations as $quote) {
            $this->addNode($nodes, 'quote', $quote->id, $quote->reference_number, $quote->status);
            $edges[] = ['source' => "rfq-{$rfq->id}", 'target' => "quote-{$quote->id}"];

            if ($quote->purchase_order_id) {
                 $po = PurchaseOrder::find($quote->purchase_order_id);
                 if ($po) {
                     $this->processPoBranch($po, $nodes, $edges, 'quote', $quote->id);
                 }
            }
        }
    }

    private function processPoBranch(PurchaseOrder $po, &$nodes, &$edges, $parentIdType, $parentId)
    {
        // Avoid duplicate processing if PO already added (e.g. referenced by both PR and Quote)
        // Check if node exists
        if (isset($nodes["po-{$po->id}"])) {
             if ($parentId) {
                 // Add the secondary edge but don't re-process children
                 $edges[] = ['source' => "{$parentIdType}-{$parentId}", 'target' => "po-{$po->id}"];
             }
             return;
        }

        $this->addNode($nodes, 'po', $po->id, $po->document_number, $po->status);
        if ($parentId) {
            $edges[] = ['source' => "{$parentIdType}-{$parentId}", 'target' => "po-{$po->id}"];
        }

        // PO Children: GRs
        foreach ($po->goodsReceipts as $gr) {
            $this->addNode($nodes, 'gr', $gr->id, $gr->receipt_number, $gr->status);
            $edges[] = ['source' => "po-{$po->id}", 'target' => "gr-{$gr->id}"];
        }

        // PO Children: Bills
        foreach ($po->vendorBills as $bill) {
            $this->addNode($nodes, 'bill', $bill->id, $bill->bill_number, $bill->status);
            $edges[] = ['source' => "po-{$po->id}", 'target' => "bill-{$bill->id}"];
        }
    }

    private function addNode(&$nodes, $type, $id, $label, $status)
    {
        $nodeId = "{$type}-{$id}";
        $nodes[$nodeId] = [
            'id' => $nodeId,
            'type' => $type, // 'pr', 'rfq', 'quote', 'po', 'gr', 'bill'
            'entity_id' => $id,
            'label' => $label,
            'status' => $status,
            // 'url' => route(...) // URL can be generated by frontend or here helper
        ];
    }
}
