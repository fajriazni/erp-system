<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Warehouse;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DirectPurchasingController extends Controller
{
    public function index()
    {
        // Get data for form
        $vendors = Contact::where('type', 'vendor')
            ->where('status', 'active')
            ->select('id', 'name')
            ->get();

        $products = Product::select('id', 'name', 'code as sku', 'cost as purchase_price')
            ->get();

        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Purchasing/Operations/Direct', [
            'vendors' => $vendors,
            'products' => $products,
            'warehouses' => $warehouses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:1',
            'unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'emergency' => 'boolean',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Generate PO number using same format as other services
                $year = now()->format('Y');
                $count = PurchaseOrder::whereYear('created_at', $year)->count() + 1;
                $poNumber = 'PO-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

                // Create PO
                $po = PurchaseOrder::create([
                    'document_number' => $poNumber,
                    'vendor_id' => $validated['vendor_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'date' => now(),
                    'status' => 'draft',
                    'source' => 'direct',
                    'notes' => $validated['notes'] ?? null,
                    'subtotal' => $validated['quantity'] * $validated['unit_price'],
                    'tax_amount' => 0,
                    'total' => $validated['quantity'] * $validated['unit_price'],
                ]);


                // Create PO Item
                $po->items()->create([
                    'product_id' => $validated['product_id'],
                    'quantity' => $validated['quantity'],
                    'unit_price' => $validated['unit_price'],
                    'subtotal' => $validated['quantity'] * $validated['unit_price'],
                ]);

                // Auto-approve if not emergency and below threshold (e.g., 10M)
                $threshold = 10000000;
                if (!($validated['emergency'] ?? false) && $po->total < $threshold) {
                    $po->update(['status' => 'purchase_order']);
                }
            });


            return redirect()->route('purchasing.orders.index')
                ->with('success', 'Direct purchase order created successfully.');
        } catch (\Exception $e) {
            \Log::error('Direct Purchasing Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return back()->withErrors(['error' => 'Failed to create purchase order: ' . $e->getMessage()])
                ->withInput();
        }
    }
}
