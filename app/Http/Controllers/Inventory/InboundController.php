<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceipt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InboundController extends Controller
{
    /**
     * Display a listing of inbound receipts (GR).
     */
    public function index()
    {
        return Inertia::render('Inventory/Inbound/Receipts', [
            'receipts' => GoodsReceipt::with(['purchaseOrder.vendor', 'warehouse', 'receivedBy'])
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Display Quality Check (QC) dashboard or list.
     */
    public function qc()
    {
        // Items pending QC
        return Inertia::render('Inventory/Inbound/Qc', [
            'pending_qc' => \App\Models\GoodsReceiptItem::with(['product', 'goodsReceipt'])
                ->where('qc_status', '!=', 'passed')
                ->orWhereNull('qc_status') // Include items not yet touched
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Cross-docking overview.
     */
    public function crossDock()
    {
        // Placeholder logic: receipts that are received but immediately needed for outbound
        return Inertia::render('Inventory/Inbound/CrossDock', [
            'cross_dockable' => GoodsReceipt::where('status', 'posted') // simplistic
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Landed Cost overview for Inventory.
     */
    public function landedCosts()
    {
        // Show receipts that have unallocated landed costs or are candidate for landed costs
        return Inertia::render('Inventory/Inbound/LandedCosts', [
            'receipts' => GoodsReceipt::with(['landedCosts'])
                ->where('status', 'posted')
                ->latest()
                ->paginate(20),
        ]);
    }
}
