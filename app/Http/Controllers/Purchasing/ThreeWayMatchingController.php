<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\ThreeWayMatchingService;
use App\Http\Controllers\Controller;
use App\Models\ThreeWayMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThreeWayMatchingController extends Controller
{
    public function __construct(
        protected ThreeWayMatchingService $matchingService
    ) {}

    public function index(Request $request)
    {
        $query = ThreeWayMatch::with([
            'purchaseOrder.vendor',
            'goodsReceipt',
            'vendorBill',
            'matchedBy',
            'approvedBy',
        ])->latest();

        // Filter by status
        if ($request->has('filter.status') && $request->input('filter.status') !== '') {
            $query->where('status', $request->input('filter.status'));
        }

        // Search
        if ($request->has('filter.global') && $request->input('filter.global') !== '') {
            $search = $request->input('filter.global');
            $query->whereHas('purchaseOrder', function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%");
            })->orWhereHas('vendorBill', function ($q) use ($search) {
                $q->where('bill_number', 'like', "%{$search}%");
            });
        }

        $matches = $query->paginate($request->input('per_page', 15))->withQueryString();

        $stats = $this->matchingService->getDashboardStats();

        return Inertia::render('Purchasing/Operations/Matching', [
            'matches' => $matches,
            'stats' => $stats,
            'filters' => $request->only(['filter', 'per_page']),
        ]);
    }

    public function show(ThreeWayMatch $match)
    {
        $match->load([
            'purchaseOrder.items.product',
            'goodsReceipt.items.product',
            'vendorBill.items.product',
            'matchedBy',
            'approvedBy',
        ]);

        return Inertia::render('Purchasing/Operations/MatchingDetail', [
            'match' => $match,
        ]);
    }

    public function approve(Request $request, ThreeWayMatch $match)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $match->approve(auth()->user(), $validated['notes'] ?? null);

            return back()->with('success', '3-way match approved successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function rematch(ThreeWayMatch $match)
    {
        try {
            if (!$match->vendorBill) {
                return back()->with('error', 'Vendor bill is required for re-matching.');
            }

            $this->matchingService->performMatching($match->vendorBill);

            return back()->with('success', 'Re-matching performed successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
