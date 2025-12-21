<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PurchaseAgreement;
use App\Models\Contact;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PurchaseAgreementController extends Controller
{
    public function __construct(
        protected \App\Domain\Purchasing\Actions\Contract\CreateContract $createContract,
        protected \App\Domain\Purchasing\Actions\Contract\UpdateContract $updateContract,
        protected \App\Domain\Purchasing\Actions\Contract\DeleteContract $deleteContract
    ) {}

    public function index(Request $request)
    {
        $query = PurchaseAgreement::with('vendor');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('reference_number', 'like', "%{$request->search}%")
                  ->orWhere('title', 'like', "%{$request->search}%")
                  ->orWhereHas('vendor', function($q) use ($request) {
                      $q->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return Inertia::render('Purchasing/Contracts/Index', [
            'agreements' => $query->latest()->paginate($request->per_page ?? 10),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/Contracts/Create', [
            'vendors' => Contact::where('type', 'vendor')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(\App\Http\Requests\Purchasing\StoreContractRequest $request)
    {
        $data = \App\Domain\Purchasing\Data\ContractData::fromRequest($request);
        
        $this->createContract->execute($data);

        return redirect()->route('purchasing.contracts.index')
            ->with('success', 'Purchase Agreement created successfully.');
    }

    public function show(PurchaseAgreement $contract)
    {
        $contract->load([
            'vendor',
            'blanketOrders',
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
        $pendingTask = \App\Models\ApprovalTask::where('workflow_instance_id', $contract->workflowInstances->first()?->id)
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->where('assigned_to_user_id', auth()->id())
                    ->orWhereHas('role', function ($q) {
                        $q->whereIn('id', auth()->user()->roles->pluck('id'));
                    });
            })
            ->with(['workflowStep', 'user', 'role'])
            ->first();

        return Inertia::render('Purchasing/Contracts/Show', [
            'agreement' => $contract,
            'workflowInstance' => $contract->workflowInstances->first(),
            'pendingApprovalTask' => $pendingTask,
        ]);
    }

    public function edit(PurchaseAgreement $contract)
    {
        if ($contract->status !== 'draft') {
             return redirect()->route('purchasing.contracts.show', $contract)
                ->with('error', 'Only draft agreements can be edited.');
        }

        return Inertia::render('Purchasing/Contracts/Edit', [
            'agreement' => $contract,
            'vendors' => Contact::where('type', 'vendor')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(\App\Http\Requests\Purchasing\UpdateContractRequest $request, PurchaseAgreement $contract)
    {
        if ($contract->status !== 'draft') {
            abort(403, 'Only draft agreements can be edited.');
        }

        $data = \App\Domain\Purchasing\Data\ContractData::fromRequest($request);

        $this->updateContract->execute($contract, $data);

        return redirect()->route('purchasing.contracts.index')
            ->with('success', 'Purchase Agreement updated successfully.');
    }

    public function destroy(PurchaseAgreement $contract)
    {
        if ($contract->status !== 'draft') {
            abort(403, 'Only draft agreements can be deleted.');
        }

        $this->deleteContract->execute($contract);

        return redirect()->route('purchasing.contracts.index')
            ->with('success', 'Purchase Agreement deleted successfully.');
    }

    public function submit(PurchaseAgreement $contract, \App\Domain\Purchasing\Services\SubmitContractService $service)
    {
        try {
            $service->execute($contract->id);

            return back()->with('success', 'Purchase Agreement submitted for approval.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function approve(PurchaseAgreement $contract, \App\Domain\Purchasing\Services\ApproveContractService $service)
    {
        try {
            $service->execute($contract->id);

            return back()->with('success', 'Purchase Agreement approved successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function hold(PurchaseAgreement $contract)
    {
        try {
            $contract->hold();
            return back()->with('success', 'Agreement put on hold.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function resume(PurchaseAgreement $contract)
    {
        try {
            $contract->resume();
            return back()->with('success', 'Agreement resumed.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function cancel(PurchaseAgreement $contract)
    {
        try {
            $contract->cancel();
            return back()->with('success', 'Agreement cancelled.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function close(PurchaseAgreement $contract)
    {
        if ($contract->status !== 'active') {
            abort(403, 'Only active agreements can be closed.');
        }

        $contract->update(['status' => 'closed']);

        return back()->with('success', 'Purchase Agreement closed successfully.');
    }

    public function revise(PurchaseAgreement $contract)
    {
        $contract->update(['status' => 'draft']);

        return back()->with('success', 'Purchase Agreement reverted to draft for revision.');
    }
}
