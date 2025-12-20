<?php

namespace App\Observers;

use App\Domain\Purchasing\Services\VersioningService;
use App\Models\PurchaseOrder;

class PurchaseOrderObserver
{
    protected VersioningService $versioningService;

    public function __construct(VersioningService $versioningService)
    {
        $this->versioningService = $versioningService;
    }

    /**
     * Handle the PurchaseOrder "created" event.
     */
    public function created(PurchaseOrder $purchaseOrder): void
    {
        // Create version 1 on creation
        $this->versioningService->createVersion($purchaseOrder, 'created');
    }

    /**
     * Handle the PurchaseOrder "updated" event.
     */
    public function updated(PurchaseOrder $purchaseOrder): void
    {
        // Skip if only timestamps changed
        if ($this->onlyTimestampsChanged($purchaseOrder)) {
            return;
        }

        // Detect what changed
        $changes = $this->detectChanges($purchaseOrder);

        if (empty($changes)) {
            return;
        }

        // Determine change type based on what changed
        $changeType = $this->determineChangeType($purchaseOrder, $changes);

        // Create version
        $this->versioningService->createVersion($purchaseOrder, $changeType, $changes);
    }

    /**
     * Check if only timestamps changed
     */
    protected function onlyTimestampsChanged(PurchaseOrder $po): bool
    {
        $dirty = array_keys($po->getDirty());
        $timestampFields = ['updated_at', 'created_at'];

        return empty(array_diff($dirty, $timestampFields));
    }

    /**
     * Detect what fields changed
     */
    protected function detectChanges(PurchaseOrder $po): array
    {
        return collect($po->getDirty())
            ->filter(fn ($v, $k) => !in_array($k, ['updated_at', 'created_at']))
            ->map(fn ($new, $field) => [
                'field' => $field,
                'old' => $po->getOriginal($field),
                'new' => $new,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Determine the type of change
     */
    protected function determineChangeType(PurchaseOrder $po, array $changes): string
    {
        // Check if status changed
        $statusChanged = collect($changes)->contains('field', 'status');

        if ($statusChanged) {
            return 'status_changed';
        }

        // Check if critical fields changed (vendor, warehouse, amounts)
        $criticalFields = ['vendor_id', 'warehouse_id', 'total', 'subtotal'];
        $criticalChanged = collect($changes)->whereIn('field', $criticalFields)->isNotEmpty();

        if ($criticalChanged) {
            return 'updated';
        }

        // Default is minor update
        return 'updated';
    }
}
