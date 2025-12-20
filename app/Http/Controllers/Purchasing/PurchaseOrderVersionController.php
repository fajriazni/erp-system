<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\VersioningService;
use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderVersionController extends Controller
{
    protected VersioningService $versioningService;

    public function __construct(VersioningService $versioningService)
    {
        $this->versioningService = $versioningService;
    }

    /**
     * Show global version dashboard
     */
    public function index()
    {
        $recentVersions = PurchaseOrderVersion::with(['purchaseOrder', 'createdBy'])
            ->latest('created_at')
            ->take(50)
            ->get();

        return Inertia::render('Purchasing/Operations/Versions', [
            'recentVersions' => $recentVersions,
        ]);
    }

    /**
     * Show version history for a specific PO
     */
    public function history(PurchaseOrder $order)
    {
        $versions = $order->versions()->with('createdBy')->latest('version_number')->get();

        return Inertia::render('Purchasing/orders/VersionHistory', [
            'order' => $order->load(['vendor', 'warehouse']),
            'versions' => $versions,
        ]);
    }

    /**
     * Show specific version details
     */
    public function show(PurchaseOrderVersion $version)
    {
        return Inertia::render('Purchasing/orders/VersionShow', [
            'version' => $version->load(['purchaseOrder', 'createdBy']),
        ]);
    }

    /**
     * Compare two versions
     */
    public function compare(PurchaseOrderVersion $version, PurchaseOrderVersion $other)
    {
        $comparison = $this->versioningService->compareVersions($version->id, $other->id);

        return Inertia::render('Purchasing/orders/VersionCompare', [
            'version1' => $version->load('createdBy'),
            'version2' => $other->load('createdBy'),
            'comparison' => $comparison,
        ]);
    }

    /**
     * Restore specific version
     */
    public function restore(PurchaseOrderVersion $version)
    {
        $po = $this->versioningService->restoreVersion($version->id);

        return redirect()->route('purchasing.orders.show', $po->id)
            ->with('success', "Purchase order restored to version {$version->version_number}.");
    }
}
