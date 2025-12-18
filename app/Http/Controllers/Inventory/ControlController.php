<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryCount;
use Inertia\Inertia;

class ControlController extends Controller
{
    /**
     * Cycle Count Management.
     */
    public function cycleCount()
    {
        return Inertia::render('Inventory/Control/CycleCount', [
            'counts' => InventoryCount::with(['warehouse'])
                ->where('type', 'cycle_count')
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Physical Opname (Full Count).
     */
    public function opname()
    {
        return Inertia::render('Inventory/Control/Opname', [
            'counts' => InventoryCount::with(['warehouse'])
                ->where('type', 'opname')
                ->latest()
                ->paginate(20),
        ]);
    }

    /**
     * Lot/Serial Tracking.
     */
    public function lots()
    {
        return Inertia::render('Inventory/Control/Lots', [
            // Placeholder for Lot model
            'lots' => [],
        ]);
    }

    /**
     * Expiry Management.
     */
    public function expiry()
    {
        return Inertia::render('Inventory/Control/Expiry', [
            // Placeholder for Expiry/Lot logic
            'expiring_stock' => [],
        ]);
    }
}
