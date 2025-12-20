<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\ApprovePurchaseOrderService;
use App\Domain\Purchasing\Services\CancelPurchaseOrderService;
use App\Domain\Purchasing\Services\CreatePurchaseOrderService;
use App\Domain\Purchasing\Services\SubmitPurchaseOrderService;
use App\Domain\Purchasing\Services\UpdatePurchaseOrderService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchasing\StorePurchaseOrderRequest;
use App\Http\Requests\Purchasing\UpdatePurchaseOrderRequest;
use App\Models\ApprovalTask;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Warehouse;
use Illuminate\Http\Request;
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

    public function create(Request $request)
    {
        $initialData = [];
        if ($request->has('blanket_order_id')) {
            $bpo = \App\Models\BlanketOrder::find($request->blanket_order_id);
            if ($bpo) {
                $initialData['blanket_order_id'] = $bpo->id;
                $initialData['vendor_id'] = $bpo->vendor_id;
                // Maybe pre-fill items? Future enhancement.
            }
        }

        return Inertia::render('Purchasing/orders/form', [
            'vendors' => Contact::where('type', 'vendor')->orWhere('type', 'both')->orderBy('name')->get(),
            'warehouses' => Warehouse::all(),
            'products' => Product::with('uom')->orderBy('name')->get(),
            'paymentTerms' => \App\Models\PaymentTerm::where('is_active', true)->select('id', 'name', 'description')->get(),
            'initialValues' => $initialData,
        ]);
    }

    public function store(
        StorePurchaseOrderRequest $request,
        CreatePurchaseOrderService $service
    ) {
        $order = $service->execute($request->validated());

        return redirect()
            ->route('purchasing.orders.show', $order)
            ->with('success', 'Purchase Order created successfully.');
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
            'versions_count' => $order->versions()->count(),
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

    public function update(
        UpdatePurchaseOrderRequest $request,
        PurchaseOrder $order,
        UpdatePurchaseOrderService $service
    ) {
        $order = $service->execute($order->id, $request->validated());

        return redirect()
            ->route('purchasing.orders.show', $order)
            ->with('success', 'Purchase Order updated successfully.');
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
