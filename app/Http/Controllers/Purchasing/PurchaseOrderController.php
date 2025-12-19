<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\ApprovePurchaseOrderService;
use App\Domain\Purchasing\Services\CancelPurchaseOrderService;
use App\Domain\Purchasing\Services\SubmitPurchaseOrderService;
use App\Domain\Purchasing\ValueObjects\DocumentNumber;
use App\Http\Controllers\Controller;
use App\Models\ApprovalTask;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $orders = QueryBuilder::for(PurchaseOrder::class)
            ->with(['vendor', 'warehouse'])
            ->allowedFilters([
                'document_number',
                'status',
                AllowedFilter::exact('vendor_id'),
                AllowedFilter::exact('warehouse_id'),
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where('document_number', 'like', "%{$value}%")
                        ->orWhereHas('vendor', function ($q) use ($value) {
                            $q->where('name', 'like', "%{$value}%");
                        });
                }),
            ])
            ->allowedSorts(['document_number', 'date', 'total', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchasing/orders/Index', [
            'orders' => $orders,
            'filters' => request()->only(['global', 'status', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/orders/form', [
            'vendors' => Contact::where('type', 'vendor')->orWhere('type', 'both')->get(),
            'warehouses' => Warehouse::all(),
            'products' => Product::with('uom')->get(), // Eager load UoM for item selection
            'paymentTerms' => \App\Models\PaymentTerm::where('is_active', true)->select('id', 'name', 'description')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'payment_term_id' => 'nullable|exists:payment_terms,id',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'withholding_tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_inclusive' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            // Generate document number using Value Object
            $validated['document_number'] = DocumentNumber::generate()->value();

            // Calculate items subtotal
            $itemsTotal = 0;
            foreach ($validated['items'] as $item) {
                $itemsTotal += $item['quantity'] * $item['unit_price'];
            }

            // Calculate tax
            $taxService = app(\App\Domain\Finance\Services\TaxCalculationService::class);
            $taxCalc = $taxService->calculatePurchaseTax(
                $itemsTotal,
                $validated['tax_rate'] ?? 0,
                $validated['withholding_tax_rate'] ?? 0,
                $validated['tax_inclusive'] ?? false
            );

            $po = PurchaseOrder::create([
                'vendor_id' => $validated['vendor_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'document_number' => $validated['document_number'],
                'date' => $validated['date'],
                'status' => 'draft',
                'notes' => $validated['notes'],
                'subtotal' => $taxCalc['subtotal'],
                'tax_rate' => $validated['tax_rate'] ?? 0,
                'tax_amount' => $taxCalc['tax_amount'],
                'withholding_tax_rate' => $validated['withholding_tax_rate'] ?? 0,
                'withholding_tax_amount' => $taxCalc['withholding_tax_amount'],
                'tax_inclusive' => $validated['tax_inclusive'] ?? false,
                'total' => $taxCalc['total'],
                'payment_term_id' => $validated['payment_term_id'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $subtotal = $item['quantity'] * $item['unit_price'];

                $po->items()->create([
                    'product_id' => $item['product_id'],
                    'description' => $product->name, // Snapshot
                    'quantity' => $item['quantity'],
                    'uom_id' => $product->uom_id, // Snapshot
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }
        });

        return redirect()->route('purchasing.orders.index')->with('success', 'Purchase Order created successfully.');
    }

    public function show(PurchaseOrder $order)
    {
        $order->load([
            'vendor',
            'warehouse',
            'items.product.uom',
            'items.uom',
            'goodsReceipts.items',
            'workflowInstances' => function ($query) {
                $query->latest()->with([
                    'workflow',
                    'currentStep',
                    'approvalTasks' => function ($q) {
                        $q->with(['user', 'role', 'workflowStep']);
                    },
                    'auditLogs.user',
                ]);
            },
        ]);

        // Get pending approval task for current user
        $pendingTask = ApprovalTask::where('workflow_instance_id', $order->workflowInstances->first()?->id)
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->where('assigned_to_user_id', auth()->id())
                    ->orWhereHas('role', function ($q) {
                        $q->whereIn('id', auth()->user()->roles->pluck('id'));
                    });
            })
            ->with(['workflowStep', 'user', 'role'])
            ->first();

        return Inertia::render('Purchasing/orders/show', [
            'order' => $order,
            'workflowInstance' => $order->workflowInstances->first(),
            'pendingApprovalTask' => $pendingTask,
        ]);
    }

    public function edit(PurchaseOrder $order)
    {
        if ($order->status !== 'draft') {
            return redirect()->back()->with('error', 'Only draft orders can be edited.');
        }

        $order->load(['items']);

        return Inertia::render('Purchasing/orders/form', [
            'order' => $order,
            'vendors' => Contact::where('type', 'vendor')->orWhere('type', 'both')->get(),
            'warehouses' => Warehouse::all(),
            'products' => Product::with('uom')->get(),
            'paymentTerms' => \App\Models\PaymentTerm::where('is_active', true)->select('id', 'name', 'description')->get(),
        ]);
    }

    public function update(Request $request, PurchaseOrder $order)
    {
        if ($order->status !== 'draft') {
            return redirect()->back()->with('error', 'Only draft orders can be edited.');
        }

        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'payment_term_id' => 'nullable|exists:payment_terms,id',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'withholding_tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_inclusive' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated, $order) {
            // Calculate items subtotal
            $itemsTotal = 0;
            foreach ($validated['items'] as $item) {
                $itemsTotal += $item['quantity'] * $item['unit_price'];
            }

            // Calculate tax
            $taxService = app(\App\Domain\Finance\Services\TaxCalculationService::class);
            $taxCalc = $taxService->calculatePurchaseTax(
                $itemsTotal,
                $validated['tax_rate'] ?? 0,
                $validated['withholding_tax_rate'] ?? 0,
                $validated['tax_inclusive'] ?? false
            );

            $order->update([
                'vendor_id' => $validated['vendor_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'date' => $validated['date'],
                'notes' => $validated['notes'],
                'subtotal' => $taxCalc['subtotal'],
                'tax_rate' => $validated['tax_rate'] ?? 0,
                'tax_amount' => $taxCalc['tax_amount'],
                'withholding_tax_rate' => $validated['withholding_tax_rate'] ?? 0,
                'withholding_tax_amount' => $taxCalc['withholding_tax_amount'],
                'tax_inclusive' => $validated['tax_inclusive'] ?? false,
                'total' => $taxCalc['total'],
                'payment_term_id' => $validated['payment_term_id'] ?? $order->payment_term_id,
            ]);

            // Sync items: Delete all and recreate (simplest logic for full form submission)
            $order->items()->delete();

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $subtotal = $item['quantity'] * $item['unit_price'];

                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'description' => $product->name,
                    'quantity' => $item['quantity'],
                    'uom_id' => $product->uom_id,
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }
        });

        return redirect()->route('purchasing.orders.index')->with('success', 'Purchase Order updated successfully.');
    }

    public function destroy(PurchaseOrder $order)
    {
        // Check using domain method
        if (! $order->canBeDeleted()) {
            return back()->withErrors(['error' => 'Only draft or cancelled purchase orders can be deleted.']);
        }

        $order->delete();

        return redirect()->route('purchasing.orders.index')->with('success', 'Purchase order deleted successfully.');
    }

    /**
     * Submit a purchase order (draft -> rfq_sent)
     */
    public function submit(PurchaseOrder $order, SubmitPurchaseOrderService $service)
    {
        try {
            $service->execute($order->id);

            return redirect()->route('purchasing.orders.show', $order)
                ->with('success', 'Purchase order submitted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Approve a purchase order (to_approve -> purchase_order)
     */
    public function approve(PurchaseOrder $order, ApprovePurchaseOrderService $service)
    {
        try {
            $service->execute($order->id);

            return redirect()->route('purchasing.orders.show', $order)
                ->with('success', 'Purchase order approved successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Cancel a purchase order
     */
    public function cancel(Request $request, PurchaseOrder $order, CancelPurchaseOrderService $service)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $service->execute($order->id, $validated['reason']);

            return redirect()->route('purchasing.orders.show', $order)
                ->with('success', 'Purchase order cancelled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function print(PurchaseOrder $order)
    {
        $order->load(['items.product', 'vendor']);

        return view('purchasing.orders.print', [
            'order' => $order,
        ]);
    }
}
