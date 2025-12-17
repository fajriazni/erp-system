<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\AwardQuotationService;
use App\Domain\Purchasing\Services\CreateRfqService;
use App\Domain\Purchasing\Services\RecordVendorBidService;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Product;
use App\Models\PurchaseRfq;
use App\Models\VendorQuotation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RfqController extends Controller
{
    public function index()
    {
        $rfqs = PurchaseRfq::with('user')
            ->latest()
            ->paginate(10); // Use server-side pagination eventually

        return Inertia::render('Purchasing/rfqs/index', [
            'rfqs' => $rfqs,
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/rfqs/create', [
            'products' => Product::with('uom')->select('id', 'name', 'code', 'uom_id')->get(),
            'uoms' => \App\Models\Uom::all(),
        ]);
    }

    public function store(Request $request, CreateRfqService $service)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'deadline' => 'required|date',
            'notes' => 'nullable|string',
            'vendor_ids' => 'nullable|array',
            'vendor_ids.*' => 'exists:contacts,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.uom_id' => 'nullable|exists:uoms,id', // Changed from uom string
            'items.*.target_price' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        $service->execute($data, auth()->id());

        return redirect()->route('purchasing.rfqs.index')->with('success', 'RFQ created successfully.');
    }

    public function show(PurchaseRfq $rfq)
    {
        $rfq->load(['lines.product.uom', 'vendors', 'quotations.vendor', 'quotations.lines.product', 'createdBy']);

        return Inertia::render('Purchasing/rfqs/show', [
            'rfq' => $rfq,
            'vendors' => Contact::where('type', 'vendor')->select('id', 'name', 'email', 'phone')->get(),
            'products' => Product::with('uom')->select('id', 'name', 'code', 'uom_id')->get(),
            'uoms' => \App\Models\Uom::all(), // Passing UOMs for reference
        ]);
    }

    public function invite(Request $request, PurchaseRfq $rfq)
    {
        $data = $request->validate([
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:contacts,id',
        ]);

        $rfq->vendors()->syncWithoutDetaching($data['vendor_ids']);
        // Here we would trigger email sending logic

        $rfq->vendors()->updateExistingPivot($data['vendor_ids'], ['sent_at' => now(), 'status' => 'sent']);

        return back()->with('success', 'Vendors invited.');
    }

    public function recordBid(Request $request, PurchaseRfq $rfq, RecordVendorBidService $service)
    {
        // This accepts a full manual bid entry
        $data = $request->validate([
            'vendor_id' => 'required|exists:contacts,id',
            'reference_number' => 'nullable|string|max:255',
            'quote_date' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:quote_date',
            'currency' => 'required|string|size:3',
            'notes' => 'nullable|string',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        $service->execute($rfq, $data);

        return back()->with('success', 'Vendor quotation recorded.');
    }

    public function award(VendorQuotation $quotation, AwardQuotationService $service)
    {
        $po = $service->execute($quotation);

        return redirect()->route('purchasing.orders.show', $po->id)
            ->with('success', 'Quotation awarded and PO created.');
    }
}
