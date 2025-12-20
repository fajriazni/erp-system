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
        return Inertia::render('Purchasing/Contracts/Show', [
            'agreement' => $contract->load(['vendor', 'blanketOrders']),
        ]);
    }

    public function edit(PurchaseAgreement $contract)
    {
        return Inertia::render('Purchasing/Contracts/Edit', [
            'agreement' => $contract,
            'vendors' => Contact::where('type', 'vendor')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(\App\Http\Requests\Purchasing\UpdateContractRequest $request, PurchaseAgreement $contract)
    {
        $data = \App\Domain\Purchasing\Data\ContractData::fromRequest($request);

        $this->updateContract->execute($contract, $data);

        return redirect()->route('purchasing.contracts.index')
            ->with('success', 'Purchase Agreement updated successfully.');
    }

    public function destroy(PurchaseAgreement $contract)
    {
        $this->deleteContract->execute($contract);

        return redirect()->route('purchasing.contracts.index')
            ->with('success', 'Purchase Agreement deleted successfully.');
    }
}
