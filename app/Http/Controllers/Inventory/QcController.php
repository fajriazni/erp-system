<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\GoodsReceiptItem;
use App\Models\QcInspection;
use App\Models\QcDefectCode;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QcController extends Controller
{
    /**
     * Show the inspection form for a specific item.
     */
    public function show($id)
    {
        // $id could be a GoodsReceiptItem ID or similar
        $item = GoodsReceiptItem::with(['product', 'goodsReceipt', 'inspections'])->findOrFail($id);
        
        return Inertia::render('Inventory/Inbound/Qc/Inspect', [
            'item' => $item,
            'defect_codes' => QcDefectCode::where('is_active', true)->get(),
            'previous_inspections' => $item->inspections()->with('inspector')->get(),
        ]);
    }

    /**
     * Store inspection results.
     */
    public function store(Request $request, $id)
    {
        $item = GoodsReceiptItem::findOrFail($id);

        $validated = $request->validate([
            'passed_qty' => 'required|numeric|min:0',
            'failed_qty' => 'required|numeric|min:0',
            'defect_reason' => 'nullable|string', // Or defect_code_id
            'notes' => 'nullable|string',
            'status' => 'required|in:passed,failed,conditional,pending',
        ]);

        DB::transaction(function () use ($item, $validated) {
            $inspection = new QcInspection([
                'inspector_id' => auth()->id(),
                'quantity_inspected' => $validated['passed_qty'] + $validated['failed_qty'],
                'passed_qty' => $validated['passed_qty'],
                'failed_qty' => $validated['failed_qty'],
                'status' => $validated['status'],
                'notes' => $validated['notes'],
                'reference_number' => 'QC-' . time(), // Simple gen
            ]);
            
            // Polymorphic save
            $inspection->inspectable()->associate($item);
            $inspection->save();

            // Update item status/qty if needed (e.g. move to QC_PASS location)
            // Logic to move stock from INBOUND to STOCK or SCRAP
        });

        return redirect()->route('inventory.inbound.qc')->with('success', 'Inspection recorded successfully.');
    }
}
