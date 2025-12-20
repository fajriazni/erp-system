<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\BlanketOrder;
use App\Models\Contact;
use App\Models\PurchaseAgreement;
use App\Models\Product;
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
            $query->where('status', $request->status);
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
            'agreements' => PurchaseAgreement::where('status', 'active')->get(['id', 'reference_number', 'title', 'vendor_id', 'start_date', 'end_date']),
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
        return Inertia::render('Purchasing/BlanketOrders/Show', [
            'blanket_order' => $blanketOrder->load(['vendor', 'agreement', 'lines.product', 'releases']),
        ]);
    }

    public function edit(BlanketOrder $blanketOrder)
    {
        return Inertia::render('Purchasing/BlanketOrders/Edit', [
            'blanket_order' => $blanketOrder->load('lines'),
            'vendors' => Contact::where('type', 'vendor')->orderBy('name')->get(['id', 'name']),
            'agreements' => PurchaseAgreement::where('status', 'active')->orWhere('id', $blanketOrder->purchase_agreement_id)->get(['id', 'reference_number', 'title', 'vendor_id', 'start_date', 'end_date']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'code', 'price']),
        ]);
    }

    public function update(\App\Http\Requests\Purchasing\UpdateBlanketOrderRequest $request, BlanketOrder $blanketOrder)
    {
        $data = \App\Domain\Purchasing\Data\BlanketOrderData::fromRequest($request);

        $this->updateBlanketOrder->execute($blanketOrder, $data);

        return redirect()->route('purchasing.blanket-orders.index')
            ->with('success', 'Blanket Order updated successfully.');
    }

    public function destroy(BlanketOrder $blanketOrder)
    {
        $this->deleteBlanketOrder->execute($blanketOrder);

        return redirect()->route('purchasing.blanket-orders.index')
            ->with('success', 'Blanket Order deleted successfully.');
    }
}
