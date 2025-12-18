<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = QueryBuilder::for(Contact::class)
            ->where(function ($query) {
                $query->where('type', 'vendor')
                    ->orWhere('type', 'both');
            })
            ->allowedFilters([
                'name',
                'email',
                AllowedFilter::callback('global', function ($query, $value) {
                    $query->where('name', 'like', "%{$value}%")
                        ->orWhere('email', 'like', "%{$value}%")
                        ->orWhere('phone', 'like', "%{$value}%");
                }),
            ])
            ->allowedSorts(['name', 'email', 'created_at'])
            ->defaultSort('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchasing/vendors/index', [
            'vendors' => $vendors,
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchasing/vendors/form', [
            'paymentTerms' => \App\Models\PaymentTerm::where('is_active', true)->select('id', 'name', 'description')->get(),
        ]);
    }

    public function store(\App\Http\Requests\VendorRequest $request)
    {
        $vendor = \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            // Create vendor with pending_onboarding status
            $vendor = Contact::create(array_merge(
                $request->validated(),
                [
                    'type' => $request->type ?? 'vendor',
                    'status' => 'pending_onboarding', // Default status for new vendors
                ]
            ));

            // Auto-create onboarding record
            \App\Models\VendorOnboarding::create([
                'vendor_id' => $vendor->id,
                'status' => \App\Models\VendorOnboarding::STATUS_PENDING,
                'checklist' => \App\Models\VendorOnboarding::getDefaultChecklist(),
                'documents' => [],
                'notes' => 'Vendor created. Awaiting document upload and onboarding completion.',
            ]);

            return $vendor;
        });

        return redirect()->route('purchasing.vendors.onboarding.show', $vendor)
            ->with('success', 'Vendor created successfully. Please complete the onboarding process.');
    }

    public function show(Contact $vendor)
    {
        // Update vendor scorecard metrics
        app(\App\Domain\Purchasing\Services\VendorScorecardService::class)->updateVendorMetrics($vendor);
        $vendor->refresh();

        // Load recent purchase orders (last 5)
        $recentOrders = $vendor->purchaseOrders()
            ->with('items')
            ->latest()
            ->limit(5)
            ->get();

        // Load recent goods receipts (last 5) - via purchase orders
        $recentReceipts = \App\Models\GoodsReceipt::whereHas('purchaseOrder', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->with('purchaseOrder')
            ->latest()
            ->limit(5)
            ->get();

        // Calculate performance metrics
        $totalOrders = $vendor->purchaseOrders()->count();
        $totalSpent = $vendor->purchaseOrders()->where('status', '!=', 'cancelled')->sum('total');
        $avgOrderValue = $totalOrders > 0 ? $totalSpent / $totalOrders : 0;

        return Inertia::render('Purchasing/vendors/show', [
            'vendor' => $vendor,
            'recentOrders' => $recentOrders,
            'recentReceipts' => $recentReceipts,
            'performance' => [
                'totalOrders' => $totalOrders,
                'totalSpent' => $totalSpent,
                'avgOrderValue' => $avgOrderValue,
            ],
        ]);
    }

    public function edit(Contact $vendor)
    {
        return Inertia::render('Purchasing/vendors/form', [
            'vendor' => $vendor,
            'paymentTerms' => \App\Models\PaymentTerm::where('is_active', true)->select('id', 'name', 'description')->get(),
        ]);
    }

    public function update(\App\Http\Requests\VendorRequest $request, Contact $vendor)
    {
        $vendor->update($request->validated());

        return redirect()->route('purchasing.vendors.show', $vendor)
            ->with('success', 'Vendor updated successfully.');
    }

    public function scorecards()
    {
        $vendors = QueryBuilder::for(Contact::class)
            ->where(function ($query) {
                $query->where('type', 'vendor')
                    ->orWhere('type', 'both');
            })
            ->whereNotNull('rating_score') // Only vendors with scores
            ->allowedFilters(['name'])
            ->allowedSorts(['name', 'rating_score', 'on_time_rate', 'quality_rate'])
            ->defaultSort('-rating_score') // Best performers first
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Purchasing/vendors/scorecards', [
            'vendors' => $vendors,
        ]);
    }

    public function onboarding()
    {
        $onboardingRecords = \App\Models\VendorOnboarding::with(['vendor', 'reviewer'])
            ->latest()
            ->paginate(20);

        $stats = [
            'pending' => \App\Models\VendorOnboarding::where('status', 'pending')->count(),
            'in_review' => \App\Models\VendorOnboarding::where('status', 'in_review')->count(),
            'approved' => \App\Models\VendorOnboarding::where('status', 'approved')->count(),
            'rejected' => \App\Models\VendorOnboarding::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Purchasing/vendors/onboarding', [
            'onboarding' => $onboardingRecords,
            'stats' => $stats,
        ]);
    }

    public function audits()
    {
        $audits = \App\Models\VendorAudit::with(['vendor', 'auditor'])
            ->latest('audit_date')
            ->paginate(20);

        $stats = [
            'scheduled' => \App\Models\VendorAudit::where('status', 'scheduled')->count(),
            'in_progress' => \App\Models\VendorAudit::where('status', 'in_progress')->count(),
            'completed' => \App\Models\VendorAudit::where('status', 'completed')->count(),
            'avg_score' => \App\Models\VendorAudit::where('status', 'completed')->avg('score') ?? 0,
        ];

        return Inertia::render('Purchasing/vendors/audits', [
            'audits' => $audits,
            'stats' => $stats,
        ]);
    }

    public function destroy(Contact $vendor)
    {
        $vendor->delete();

        return redirect()->route('purchasing.vendors.index')->with('success', 'Vendor deleted successfully.');
    }
}
