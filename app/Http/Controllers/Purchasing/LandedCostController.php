<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\LandedCost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandedCostController extends Controller
{
    public function index(Request $request)
    {
        $query = LandedCost::with([
            'goodsReceipt.purchaseOrder.vendor',
        ])->latest();

        // Search
        if ($request->has('filter.global') && $request->input('filter.global') !== '') {
            $search = $request->input('filter.global');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('goodsReceipt', function ($q) use ($search) {
                      $q->where('receipt_number', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by cost type
        if ($request->has('filter.cost_type') && $request->input('filter.cost_type') !== '') {
            $query->where('cost_type', $request->input('filter.cost_type'));
        }

        $landed_costs = $query->paginate($request->input('per_page', 15))->withQueryString();

        // Statistics
        $stats = [
            'total_costs' => LandedCost::count(),
            'total_amount' => LandedCost::sum('amount'),
            'this_month' => LandedCost::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
        ];

        return Inertia::render('Purchasing/Operations/LandedCosts', [
            'landed_costs' => $landed_costs,
            'stats' => $stats,
            'filters' => $request->only(['filter', 'per_page']),
        ]);
    }
}
