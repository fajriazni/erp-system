<?php

namespace App\Domain\Purchasing\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderVersion;
use Illuminate\Support\Facades\DB;

class VersioningService
{
    /**
     * Create a new version for the given purchase order
     */
    public function createVersion(
        PurchaseOrder $po,
        string $changeType,
        ?array $changes = null
    ): PurchaseOrderVersion {
        return DB::transaction(function () use ($po, $changeType, $changes) {
            // Get next version number
            $lastVersion = $po->versions()->latest('version_number')->first();
            $versionNumber = $lastVersion ? $lastVersion->version_number + 1 : 1;

            // Create snapshot of current state
            $snapshot = $this->createSnapshot($po);

            // Generate change summary
            $changeSummary = $changes ? $this->generateChangeSummary($changes) : null;

            // Create version
            return PurchaseOrderVersion::create([
                'purchase_order_id' => $po->id,
                'version_number' => $versionNumber,
                'change_type' => $changeType,
                'change_summary' => $changeSummary,
                'snapshot' => $snapshot,
                'changes' => $changes,
                'created_by' => auth()->id(),
            ]);
        });
    }

    /**
     * Create a snapshot of the current PO state
     */
    protected function createSnapshot(PurchaseOrder $po): array
    {
        // Load relationships if not loaded
        $po->loadMissing(['vendor', 'warehouse', 'items.product', 'items.uom']);

        return [
            'header' => [
                'vendor_id' => $po->vendor_id,
                'vendor_name' => $po->vendor->name ?? null,
                'warehouse_id' => $po->warehouse_id,
                'warehouse_name' => $po->warehouse->name ?? null,
                'document_number' => $po->document_number,
                'date' => $po->date instanceof \Carbon\Carbon ? $po->date->format('Y-m-d') : $po->date,
                'status' => $po->status,
                'source' => $po->source,
                'notes' => $po->notes,
                'subtotal' => $po->subtotal,
                'tax_rate' => $po->tax_rate,
                'tax_amount' => $po->tax_amount,
                'withholding_tax_rate' => $po->withholding_tax_rate,
                'withholding_tax_amount' => $po->withholding_tax_amount,
                'tax_inclusive' => $po->tax_inclusive,
                'total' => $po->total,
            ],
            'items' => $po->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? null,
                    'product_code' => $item->product->code ?? null,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'uom_id' => $item->uom_id,
                    'uom_name' => $item->uom->name ?? null,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ];
            })->toArray(),
        ];
    }

    /**
     * Generate human-readable change summary
     */
    protected function generateChangeSummary(array $changes): string
    {
        $summaries = [];

        foreach ($changes as $change) {
            $field = $change['field'];
            $old = $change['old'];
            $new = $change['new'];

            // Handle different field types
            $summary = match ($field) {
                'vendor_id' => "Changed vendor",
                'warehouse_id' => "Changed warehouse",
                'status' => "Status changed from '{$old}' to '{$new}'",
                'total' => "Total amount changed",
                'date' => "Changed PO date",
                'notes' => $old ? "Updated notes" : "Added notes",
                default => "Changed {$field}",
            };

            $summaries[] = $summary;
        }

        return implode(', ', $summaries);
    }

    /**
     * Compare two versions and return differences
     */
    public function compareVersions(int $versionId1, int $versionId2): array
    {
        $version1 = PurchaseOrderVersion::findOrFail($versionId1);
        $version2 = PurchaseOrderVersion::findOrFail($versionId2);

        $snapshot1 = $version1->snapshot;
        $snapshot2 = $version2->snapshot;

        return [
            'header_changes' => $this->compareArrays($snapshot1['header'], $snapshot2['header']),
            'items_changes' => $this->compareItems($snapshot1['items'], $snapshot2['items']),
            'version1' => [
                'number' => $version1->version_number,
                'created_at' => $version1->created_at,
                'created_by' => $version1->createdBy->name ?? 'System',
            ],
            'version2' => [
                'number' => $version2->version_number,
                'created_at' => $version2->created_at,
                'created_by' => $version2->createdBy->name ?? 'System',
            ],
        ];
    }

    /**
     * Compare two arrays and return differences
     */
    protected function compareArrays(array $arr1, array $arr2): array
    {
        $differences = [];

        foreach ($arr1 as $key => $value) {
            if (!isset($arr2[$key]) || $arr2[$key] !== $value) {
                $differences[$key] = [
                    'old' => $value,
                    'new' => $arr2[$key] ?? null,
                    'changed' => true,
                ];
            }
        }

        return $differences;
    }

    /**
     * Compare item arrays
     */
    protected function compareItems(array $items1, array $items2): array
    {
        return [
            'added' => collect($items2)->filter(function ($item2) use ($items1) {
                return !collect($items1)->contains('id', $item2['id']);
            })->values()->toArray(),
            'removed' => collect($items1)->filter(function ($item1) use ($items2) {
                return !collect($items2)->contains('id', $item1['id']);
            })->values()->toArray(),
            'modified' => collect($items1)->map(function ($item1) use ($items2) {
                $item2 = collect($items2)->firstWhere('id', $item1['id']);
                if (!$item2) {
                    return null;
                }

                $changes = [];
                foreach (['quantity', 'unit_price', 'subtotal'] as $field) {
                    if ($item1[$field] != $item2[$field]) {
                        $changes[$field] = [
                            'old' => $item1[$field],
                            'new' => $item2[$field],
                        ];
                    }
                }

                return $changes ? ['id' => $item1['id'], 'product_name' => $item1['product_name'], 'changes' => $changes] : null;
            })->filter()->values()->toArray(),
        ];
    }

    /**
     * Restore a PO to a specific version
     */
    public function restoreVersion(int $versionId): PurchaseOrder
    {
        $version = PurchaseOrderVersion::findOrFail($versionId);

        return DB::transaction(function () use ($version) {
            // Restore the PO
            $po = $version->restore();

            // Create a new version to record the restoration
            $this->createVersion($po, 'restored', [
                [
                    'field' => 'restoration',
                    'old' => $po->latestVersion()?->version_number,
                    'new' => $version->version_number,
                ],
            ]);

            return $po;
        });
    }
}
