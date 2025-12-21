<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\BlanketOrder;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseAgreement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlanketOrderController extends Controller
{
    public function __construct(
        protected \App\Domain\Purchasing\Actions\BlanketOrder\CreateBlanketOrder $createBlanketOrder,
        protected \App\Domain\Purchasing\Actions\BlanketOrder\UpdateBlanketOrder $updateBlanketOrder,
        protected \App\Domain\Purchasing\Actions\BlanketOrder\DeleteBlanketOrder $deleteBlanketOrder
    ) {}

    public function index(Request $request)
    {
        $query = BlanketOrder::with(['vendor', 'agreement']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('number', 'like', "%{$request->search}%")
                    ->orWhereHas('vendor', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%");
                    })
                    ->orWhereHas('agreement', function ($q) use ($request) {
                        $q->where('reference_number', 'like', "%{$request->search}%");
                    });
            });
        }

        if ($request->status && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->whereIn('status', [
                    BlanketOrder::STATUS_OPEN,
                    BlanketOrder::STATUS_PARTIALLY_ORDERED,
                ]);
            } elseif ($request->status === 'closed') {
                $query->whereIn('status', [
                    BlanketOrder::STATUS_CLOSED,
                    BlanketOrder::STATUS_FULFILLED,
                    BlanketOrder::STATUS_EXPIRED,
                    BlanketOrder::STATUS_CANCELLED,
                ]);
            } elseif ($request->status === 'draft') {
                $query->whereIn('status', [
                    BlanketOrder::STATUS_DRAFT,
                    BlanketOrder::STATUS_REJECTED,
                ]);
            } else {
                $query->where('status', $request->status);
            }
        }

        return Inertia::render('Purchasing/BlanketOrders/Index', [
            'blanket_orders' => $query->latest()->paginate($request->per_page ?? 10),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Purchasing/BlanketOrders/Create', [
            'vendors' => Contact::where('type', 'vendor')->orderBy('name')->get(['id', 'name']),
            'agreements' => PurchaseAgreement::where('status', 'active')
                ->when($request->purchase_agreement_id, function ($q) use ($request) {
                    $q->orWhere('id', $request->purchase_agreement_id);
                })
                ->get(['id', 'reference_number', 'title', 'vendor_id', 'start_date', 'end_date']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'code', 'price']),
            'initial_values' => [
                'vendor_id' => $request->vendor_id,
                'purchase_agreement_id' => $request->purchase_agreement_id,
            ],
        ]);
    }

    public function store(\App\Http\Requests\Purchasing\StoreBlanketOrderRequest $request)
    {
        $data = \App\Domain\Purchasing\Data\BlanketOrderData::fromRequest($request);

        $this->createBlanketOrder->execute($data);

        return redirect()->route('purchasing.blanket-orders.index')
            ->with('success', 'Blanket Order created successfully.');
    }

    public function show(BlanketOrder $blanketOrder)
    {
        $blanketOrder->load([
            'vendor',
            'agreement',
            'lines.product',
            'releases',
            'latestWorkflow.workflow.steps',
            'latestWorkflow.approvalTasks.workflowStep',
            'latestWorkflow.approvalTasks.user',
            'latestWorkflow.approvalTasks.role',
        ]);

        $workflowInstance = $blanketOrder->latestWorkflow;

        $pendingApprovalTask = null;
        if ($workflowInstance && $workflowInstance->status === 'in_progress') {
            $pendingApprovalTask = \App\Models\ApprovalTask::where('workflow_instance_id', $workflowInstance->id)
                ->where('status', 'pending')
                ->where(function ($query) {
                    $query->where('assigned_to_user_id', auth()->id())
                        ->orWhereIn('assigned_to_role_id', auth()->user()->roles->pluck('id'));
                })
                ->first();
        }

        return Inertia::render('Purchasing/BlanketOrders/Show', [
            'blanket_order' => $blanketOrder,
            'workflowInstance' => $workflowInstance,
            'pendingApprovalTask' => $pendingApprovalTask,
        ]);
    }

    public function edit(BlanketOrder $blanketOrder)
    {
        if ($blanketOrder->status !== 'draft' && $blanketOrder->status !== 'rejected') {
            return redirect()->route('purchasing.blanket-orders.show', $blanketOrder)
                ->with('error', 'Only draft or rejected blanket orders can be edited.');
        }

        return Inertia::render('Purchasing/BlanketOrders/Edit', [
            'blanket_order' => $blanketOrder->load('lines'),
            'vendors' => Contact::where('type', 'vendor')->orderBy('name')->get(['id', 'name']),
            'agreements' => PurchaseAgreement::where('status', 'active')->orWhere('id', $blanketOrder->purchase_agreement_id)->get(['id', 'reference_number', 'title', 'vendor_id', 'start_date', 'end_date']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'code', 'price']),
        ]);
    }

    public function update(\App\Http\Requests\Purchasing\UpdateBlanketOrderRequest $request, BlanketOrder $blanketOrder)
    {
        if ($blanketOrder->status !== 'draft' && $blanketOrder->status !== 'rejected') {
            abort(403, 'Only draft or rejected blanket orders can be edited.');
        }

        $data = \App\Domain\Purchasing\Data\BlanketOrderData::fromRequest($request);

        $this->updateBlanketOrder->execute($blanketOrder, $data);

        return redirect()->route('purchasing.blanket-orders.index')
            ->with('success', 'Blanket Order updated successfully.');
    }

    public function destroy(BlanketOrder $blanketOrder)
    {
        if ($blanketOrder->status !== 'draft') {
            abort(403, 'Only draft blanket orders can be deleted.');
        }

        $this->deleteBlanketOrder->execute($blanketOrder);

        return redirect()->route('purchasing.blanket-orders.index')
            ->with('success', 'Blanket Order deleted successfully.');
    }

    public function activate(BlanketOrder $blanketOrder)
    {
        // Deprecated/Alias for approve or manual activation bypass?
        // Let's redirect to approve or use approve service logic?
        // Using "Activate" button usually means "Make it Open".
        // If workflow is enabled, it should probably be "Submit" then "Approve".
        // But for backward compatibility or direct activation if allowed:

        try {
            // Check if can auto-approve/activate directly?
            // If it's draft, maybe we submit AND approve if user has permission?
            // For now, let's map 'activate' to 'approve' service if status is pending,
            // OR if it's draft/sent, assume manual legacy activation.

            // Actually, let's just make it use the Approve Service if it's pending.
            if ($blanketOrder->status === \App\Models\BlanketOrder::STATUS_PENDING_APPROVAL) {
                (new \App\Domain\Purchasing\Services\ApproveBlanketOrderService)->execute($blanketOrder->id);

                return back()->with('success', 'Blanket Order approved and activated.');
            }

            // Fallback for Draft/Sent (Legacy manual activation)
            $blanketOrder->activate();

            return back()->with('success', 'Blanket Order activated.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function submit(BlanketOrder $blanketOrder, \App\Domain\Purchasing\Services\SubmitBlanketOrderService $service)
    {
        try {
            $service->execute($blanketOrder->id);

            return back()->with('success', 'Blanket Order submitted for approval.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function approve(BlanketOrder $blanketOrder, \App\Domain\Purchasing\Services\ApproveBlanketOrderService $service)
    {
        try {
            $service->execute($blanketOrder->id);

            return back()->with('success', 'Blanket Order approved.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Deprecated alias for submit (was 'send' to vendor)
    public function send(BlanketOrder $blanketOrder, \App\Domain\Purchasing\Services\SubmitBlanketOrderService $service)
    {
        return $this->submit($blanketOrder, $service);
    }

    public function close(BlanketOrder $blanketOrder)
    {
        try {
            $blanketOrder->close();

            return back()->with('success', 'Blanket Order closed.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function cancel(BlanketOrder $blanketOrder)
    {
        try {
            $blanketOrder->cancel();

            return back()->with('success', 'Blanket Order cancelled.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function revise(BlanketOrder $blanketOrder)
    {
        $blanketOrder->update(['status' => 'draft']);

        return back()->with('success', 'Blanket Order reverted to draft for revision.');
    }
}
