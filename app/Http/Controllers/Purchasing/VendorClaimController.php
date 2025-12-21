<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\VendorClaimService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\PurchaseOrder;
use App\Models\VendorClaim;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorClaimController extends Controller
{
    public function __construct(
        protected VendorClaimService $claimService
    ) {}

    public function index()
    {
        $claims = VendorClaim::with(['vendor', 'purchaseOrder', 'goodsReceipt'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Purchasing/claims/Index', [
            'claims' => $claims,
        ]);
    }

    public function create()
    {
        $vendors = Contact::where('type', 'vendor')->get();
        $purchaseOrders = PurchaseOrder::with('vendor')->latest()->take(50)->get();

        return Inertia::render('Purchasing/claims/Create', [
            'vendors' => $vendors,
            'purchaseOrders' => $purchaseOrders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'purchase_order_id' => 'nullable|exists:purchase_orders,id',
            'goods_receipt_id' => 'nullable|exists:goods_receipts,id',
            'claim_type' => 'required|in:price_difference,damaged_goods,missing_items,shipping_cost,quality_issue,other',
            'claim_amount' => 'required|numeric|min:0.01',
            'description' => 'required|string',
            'evidence_attachments' => 'nullable|array',
        ]);

        $claim = $this->claimService->submitClaim($validated);

        return redirect()->route('purchasing.claims.show', $claim)
            ->with('success', 'Vendor claim submitted successfully');
    }

    public function show(VendorClaim $claim)
    {
        $claim->load([
            'vendor',
            'purchaseOrder',
            'goodsReceipt',
            'submitter',
            'reviewer',
            'approver',
            'settler',
        ]);

        return Inertia::render('Purchasing/claims/Show', [
            'claim' => $claim,
        ]);
    }

    public function edit(VendorClaim $claim)
    {
        if ($claim->status !== 'submitted') {
            return redirect()->route('purchasing.claims.show', $claim)
                ->with('error', 'Only submitted claims can be edited');
        }

        $vendors = Contact::where('type', 'vendor')->get();

        return Inertia::render('Purchasing/claims/Edit', [
            'claim' => $claim,
            'vendors' => $vendors,
        ]);
    }

    public function update(Request $request, VendorClaim $claim)
    {
        if ($claim->status !== 'submitted') {
            return back()->with('error', 'Only submitted claims can be updated');
        }

        $validated = $request->validate([
            'claim_amount' => 'required|numeric|min:0.01',
            'description' => 'required|string',
        ]);

        $claim->update($validated);

        return redirect()->route('purchasing.claims.show', $claim)
            ->with('success', 'Claim updated successfully');
    }

    public function destroy(VendorClaim $claim)
    {
        if ($claim->status !== 'submitted') {
            return back()->with('error', 'Only submitted claims can be deleted');
        }

        $claim->delete();

        return redirect()->route('purchasing.claims.index')
            ->with('success', 'Claim deleted successfully');
    }

    // Workflow actions
    public function review(VendorClaim $claim)
    {
        $this->claimService->review($claim);

        return back()->with('success', 'Claim moved to review');
    }

    public function approve(VendorClaim $claim)
    {
        $this->claimService->approve($claim);

        return back()->with('success', 'Claim approved');
    }

    public function dispute(Request $request, VendorClaim $claim)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $this->claimService->dispute($claim, $validated['reason']);

        return back()->with('success', 'Claim disputed');
    }

    public function settle(Request $request, VendorClaim $claim)
    {
        $validated = $request->validate([
            'settlement_type' => 'required|in:replacement,refund,credit_note,other',
            'settlement_amount' => 'required|numeric|min:0.01',
        ]);

        $this->claimService->settle($claim, $validated);

        return back()->with('success', 'Claim settled successfully');
    }

    public function reject(Request $request, VendorClaim $claim)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $this->claimService->reject($claim, $validated['reason']);

        return back()->with('success', 'Claim rejected');
    }
}
