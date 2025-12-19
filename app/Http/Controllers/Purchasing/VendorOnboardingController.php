<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\VendorOnboarding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VendorOnboardingController extends Controller
{
    /**
     * Display vendor onboarding dashboard.
     */
    public function index()
    {
        $onboardings = VendorOnboarding::with(['vendor', 'reviewer'])
            ->whereIn('status', [
                VendorOnboarding::STATUS_PENDING,
                VendorOnboarding::STATUS_IN_REVIEW
            ])
            ->latest()
            ->paginate(20);

        // Calculate stats for dashboard cards
        $stats = [
            'pending' => VendorOnboarding::where('status', VendorOnboarding::STATUS_PENDING)->count(),
            'in_review' => VendorOnboarding::where('status', VendorOnboarding::STATUS_IN_REVIEW)->count(),
            'approved' => VendorOnboarding::where('status', VendorOnboarding::STATUS_APPROVED)->count(),
            'rejected' => VendorOnboarding::where('status', VendorOnboarding::STATUS_REJECTED)->count(),
        ];

        return Inertia::render('Purchasing/vendors/Onboarding', [
            'onboarding' => $onboardings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display specific vendor onboarding details.
     */
    public function show(Contact $vendor)
    {
        $onboarding = $vendor->onboarding()->with('reviewer')->firstOrFail();

        return Inertia::render('Purchasing/vendors/OnboardingDetail', [
            'vendor' => $vendor->load('paymentTerm'),
            'onboarding' => $onboarding,
        ]);
    }

    /**
     * Update a checklist item.
     */
    public function updateChecklist(VendorOnboarding $onboarding, Request $request)
    {
        $request->validate([
            'item' => 'required|string',
            'completed' => 'required|boolean',
        ]);

        $checklist = $onboarding->checklist;
        
        if (!isset($checklist[$request->item])) {
            return back()->withErrors(['item' => 'Invalid checklist item.']);
        }

        $checklist[$request->item]['completed'] = $request->completed;
        
        $onboarding->update(['checklist' => $checklist]);

        return back()->with('success', 'Checklist updated successfully.');
    }

    /**
     * Submit onboarding for review.
     */
    public function submitForReview(VendorOnboarding $onboarding)
    {
        // Check if all checklist items are completed
        $allCompleted = collect($onboarding->checklist)
            ->every(fn($item) => $item['completed'] === true);

        if (!$allCompleted) {
            return back()->withErrors([
                'checklist' => 'Please complete all checklist items before submitting for review.'
            ]);
        }

        $onboarding->update([
            'status' => VendorOnboarding::STATUS_IN_REVIEW
        ]);

        // TODO: Trigger workflow engine here
        // event(new VendorOnboardingSubmitted($onboarding));

        return back()->with('success', 'Onboarding submitted for review successfully.');
    }

    /**
     * Approve vendor onboarding.
     */
    public function approve(VendorOnboarding $onboarding, Request $request)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($onboarding, $request) {
            $onboarding->update([
                'status' => VendorOnboarding::STATUS_APPROVED,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            // Activate vendor
            $onboarding->vendor->update([
                'status' => 'active'
            ]);
        });

        return redirect()->route('purchasing.vendors.onboarding.index')
            ->with('success', 'Vendor onboarding approved. Vendor is now active and can receive purchase orders.');
    }

    /**
     * Reject vendor onboarding.
     */
    public function reject(VendorOnboarding $onboarding, Request $request)
    {
        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        DB::transaction(function () use ($onboarding, $request) {
            $onboarding->update([
                'status' => VendorOnboarding::STATUS_REJECTED,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'notes' => $request->notes,
            ]);

            // Keep vendor inactive
            $onboarding->vendor->update([
                'status' => 'inactive'
            ]);
        });

        return redirect()->route('purchasing.vendors.onboarding.index')
            ->with('success', 'Vendor onboarding rejected. Vendor notified to update documents.');
    }
}
