<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\CreatePurchaseRequestService;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PurchaseRequestController extends Controller
{
    public function index()
    {
        $requests = QueryBuilder::for(PurchaseRequest::class)
            ->with(['requester'])
            ->withCount(['items'])
            ->allowedFilters([
                'document_number',
                'status',
                AllowedFilter::exact('requester_id'),
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where('document_number', 'like', "%{$value}%")
                        ->orWhereHas('requester', function ($q) use ($value) {
                            $q->where('name', 'like', "%{$value}%");
                        });
                }),
            ])
            ->allowedSorts(['document_number', 'date', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchasing/requests/index', [
            'requests' => $requests,
            'filters' => request()->only(['filter']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/requests/create', [
            'products' => Product::with('uom')->get(),
        ]);
    }

    public function store(Request $request, CreatePurchaseRequestService $service)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'required_date' => 'nullable|date|after_or_equal:date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.estimated_unit_price' => 'nullable|numeric|min:0',
        ]);

        $service->execute($validated, auth()->id());

        return redirect()->route('purchasing.requests.index')
            ->with('success', 'Purchase Request created successfully.');
    }

    public function edit(PurchaseRequest $request)
    {
        if ($request->status !== 'draft') {
            return redirect()->route('purchasing.requests.show', $request->id)
                ->with('error', 'Only draft requests can be edited.');
        }

        $request->load(['items.product.uom']);

        return Inertia::render('Purchasing/requests/edit', [
            'request' => $request,
            'products' => Product::with('uom')->get(),
        ]);
    }

    public function update(Request $request, $id, \App\Domain\Purchasing\Services\UpdatePurchaseRequestService $service)
    {
        $purchaseRequest = PurchaseRequest::findOrFail($id);

        $validated = $request->validate([
            'date' => 'required|date',
            'required_date' => 'nullable|date|after_or_equal:date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.estimated_unit_price' => 'nullable|numeric|min:0',
        ]);

        try {
            $service->execute($purchaseRequest, $validated, auth()->id());
            
            return redirect()->route('purchasing.requests.show', $purchaseRequest->id)
                ->with('success', 'Purchase Request updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(PurchaseRequest $request)
    {
        $request->load(['items.product.uom', 'requester', 'rfqs']);

        $request->load([
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

        $vendors = \App\Models\Contact::all();

        // Get pending approval task for current user
        $pendingTask = \App\Models\ApprovalTask::where('workflow_instance_id', $request->workflowInstances->first()?->id)
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->where('assigned_to_user_id', auth()->id())
                    ->orWhereHas('role', function ($q) {
                        $q->whereIn('id', auth()->user()->roles->pluck('id'));
                    });
            })
            ->with(['workflowStep', 'user', 'role'])
            ->first();

        return Inertia::render('Purchasing/requests/show', [
            'request' => $request,
            'vendors' => $vendors,
            'workflowInstance' => $request->workflowInstances->first(),
            'pendingApprovalTask' => $pendingTask,
        ]);
    }

    public function destroy(PurchaseRequest $request)
    {
        if ($request->status !== 'draft') {
            return back()->withErrors(['error' => 'Only draft requests can be deleted.']);
        }

        $request->delete();

        return redirect()->route('purchasing.requests.index')
            ->with('success', 'Purchase Request deleted.');
    }

    public function submit(PurchaseRequest $request, \App\Domain\Purchasing\Services\SubmitPurchaseRequestService $service)
    {
        try {
            $service->execute($request);

            return back()->with('success', 'Purchase Request submitted for approval.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function convertToPO(PurchaseRequest $request, \App\Domain\Purchasing\Services\ConvertPRToPOService $service)
    {
        // We need vendor_id. Ideally this comes from a form/modal where user selects vendor.
        // For now, let's assume valid vendor_id is passed in request, or if not, redirect to a selection page?
        // Let's make it simple: Redirect to PO Create page pre-filled?
        // OR: Modal on Show page to select vendor then POST here.

        $vendorId = request('vendor_id');
        if (! $vendorId) {
            return back()->withErrors(['error' => 'Vendor is required for conversion.']);
        }

        try {
            $po = $service->execute($request, $vendorId);

            return redirect()->route('purchasing.orders.show', $po->id)
                ->with('success', 'Purchase Order created from Request.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
