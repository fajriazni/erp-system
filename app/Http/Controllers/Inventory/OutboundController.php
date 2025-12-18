<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\DeliveryOrder;
use Inertia\Inertia;

class OutboundController extends Controller
{
    /**
     * Picking Operations (List of Delivery Orders ready to pick).
     */
    public function picking()
    {
        return Inertia::render('Inventory/Outbound/Picking', [
            // In a real WMS, 'picking' status might be separate or derived
            'picking_list' => DeliveryOrder::with(['salesOrder.customer', 'warehouse'])
                ->whereIn('status', ['confirmed', 'processing'])
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Show picking interface for a specific delivery order.
     */
    public function pickingShow(DeliveryOrder $delivery)
    {
        $delivery->load(['lines.product', 'salesOrder.customer', 'warehouse']);
        
        return Inertia::render('Inventory/Outbound/Picking/Process', [
            'delivery' => $delivery,
        ]);
    }

    /**
     * Process picked quantities for a delivery order.
     */
    public function pickingStore(DeliveryOrder $delivery, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'lines' => 'required|array',
            'lines.*.id' => 'required|exists:delivery_order_lines,id',
            'lines.*.quantity_done' => 'required|numeric|min:0',
        ]);

        // Update picked quantities
        foreach ($validated['lines'] as $lineData) {
            $line = $delivery->lines()->find($lineData['id']);
            if ($line) {
                $line->update([
                    'quantity_done' => $lineData['quantity_done'],
                ]);
            }
        }

        // Check if all lines are fully picked
        $allPicked = $delivery->lines()->every(function ($line) {
            return $line->quantity_done >= $line->quantity_ordered;
        });

        // Update delivery status
        if ($allPicked) {
            $delivery->update(['status' => 'packed']); // Ready for shipping
        } else {
            $delivery->update(['status' => 'processing']); // Partially picked
        }

        return redirect()->route('inventory.outbound.picking')
            ->with('success', 'Picking completed successfully.');
    }

    /**
     * Wave Picking (Grouped picking).
     */
    public function waves()
    {
        return Inertia::render('Inventory/Outbound/Waves', [
             // Placeholder for waves logic
             'waves' => [],
        ]);
    }

    /**
     * Shipping & Delivery (Ready to ship).
     */
    public function shipping()
    {
        return Inertia::render('Inventory/Outbound/Shipping', [
            'shipments' => DeliveryOrder::with(['salesOrder.customer', 'warehouse'])
                ->where('status', 'packed') // or ready_to_ship
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Backorder Management.
     */
    public function backorders()
    {
        return Inertia::render('Inventory/Outbound/Backorders', [
            'backorders' => DeliveryOrder::with(['salesOrder', 'lines.product'])
                ->whereHas('lines', function($q) {
                    $q->whereColumn('quantity_done', '<', 'quantity_ordered');
                })
                ->where('status', '!=', 'cancelled')
                ->latest()
                ->paginate(20),
        ]);
    }
}
