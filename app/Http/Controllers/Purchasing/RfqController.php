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
    public function index(Request $request)
    {
        $rfqs = PurchaseRfq::with('user')
            ->when($request->input('filter.status'), function ($query, $status) {
                if ($status !== 'all') {
                    $query->where('status', $status);
                }
            })
            ->latest()
            ->paginate($request->input('per_page', 10));

        return Inertia::render('Purchasing/rfqs/index', [
            'rfqs' => $rfqs,
        ]);
    }

    public function create(Request $request)
    {
        $initialData = [];

        if ($request->has('pr_id')) {
            $pr = \App\Models\PurchaseRequest::with('items.product')->find($request->pr_id);
            if ($pr) {
                $initialData = [
                    'title' => 'RFQ from '.$pr->document_number,
                    'items' => $pr->items->map(function ($item) {
                        return [
                            'product_id' => (string) $item->product_id,
                            'quantity' => $item->quantity,
                            'uom_id' => (string) $item->product->uom_id,
                            'target_price' => $item->estimated_unit_price,
                            'notes' => $item->notes,
                        ];
                    }),
                ];
            }
        }

        return Inertia::render('Purchasing/rfqs/create', [
            'products' => Product::with('uom')->select('id', 'name', 'code', 'uom_id')->get(),
            'uoms' => \App\Models\Uom::all(),
            'initialData' => $initialData,
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

        $productIds = $rfq->lines->pluck('product_id');
        $suggestedVendorIds = \App\Models\VendorPricelist::whereIn('product_id', $productIds)
            ->pluck('vendor_id')
            ->unique()
            ->values()
            ->all();

        return Inertia::render('Purchasing/rfqs/show', [
            'rfq' => $rfq,
            'vendors' => Contact::where('type', 'vendor')->select('id', 'name', 'email', 'phone')->get(),
            'suggestedVendorIds' => $suggestedVendorIds,
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

        // Disable observer to prevent double status update if exists, or just handle gracefully
        $vendors = Contact::whereIn('id', $data['vendor_ids'])->get();
        foreach ($vendors as $vendor) {
            if ($vendor->email) {
                try {
                    \Illuminate\Support\Facades\Mail::to($vendor->email)
                        ->send(new \App\Mail\Purchasing\SendRfqToVendor($rfq, $vendor));
                } catch (\Exception $e) {
                    // Log error but continue
                    \Illuminate\Support\Facades\Log::error("Failed to send RFQ email to {$vendor->email}: ".$e->getMessage());
                }
            }
        }

        $rfq->vendors()->updateExistingPivot($data['vendor_ids'], ['sent_at' => now(), 'status' => 'sent']);

        if ($rfq->status === 'draft') {
            $rfq->update(['status' => 'open']);
        }

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
    public function edit(PurchaseRfq $rfq)
    {
        $rfq->load(['lines.product.uom']);

        $formData = [
            'title' => $rfq->title,
            'deadline' => $rfq->deadline->format('Y-m-d'),
            'notes' => $rfq->notes,
            'items' => $rfq->lines->map(function ($line) {
                return [
                    'product_id' => (string) $line->product_id,
                    'quantity' => $line->quantity,
                    'uom_id' => (string) $line->uom_id,
                    'target_price' => $line->target_price,
                    'notes' => $line->notes,
                ];
            }),
        ];

        return Inertia::render('Purchasing/rfqs/edit', [
            'rfq' => $rfq,
            'products' => Product::with('uom')->select('id', 'name', 'code', 'uom_id')->get(),
            'uoms' => \App\Models\Uom::all(),
            'initialData' => $formData,
        ]);
    }

    public function update(Request $request, PurchaseRfq $rfq)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'deadline' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.uom_id' => 'nullable|exists:uoms,id',
            'items.*.target_price' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        // Simple update logic - can be moved to dedicated service if complex
        $rfq->update([
            'title' => $data['title'],
            'deadline' => $data['deadline'],
            'notes' => $data['notes'],
        ]);

        // Sync items - simpler to delete and recreate for RFQ as it's draft
        // Ideally should sync by ID to preserve logic if needed, but for now strict replace is fine for Draft
        if ($rfq->status === 'draft') {
            $rfq->lines()->delete();
            foreach ($data['items'] as $item) {
                $rfq->lines()->create($item);
            }
        }

        return redirect()->route('purchasing.rfqs.index')->with('success', 'RFQ updated successfully.');
    }
}
