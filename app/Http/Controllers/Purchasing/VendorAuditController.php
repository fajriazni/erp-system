<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VendorAudit;

class VendorAuditController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:contacts,id'],
            'audit_type' => ['required', 'in:initial,periodic,quality,compliance'],
            'audit_date' => ['required', 'date', 'after_or_equal:today'],
            'auditor_id' => ['required', 'exists:users,id'],
        ]);

        $validated['status'] = VendorAudit::STATUS_SCHEDULED;
        $validated['score'] = null;

        VendorAudit::create($validated);

        return redirect()->back()->with('success', 'Audit scheduled successfully.');
    }

    public function show(VendorAudit $audit)
    {
        $audit->load(['vendor', 'auditor']);
        
        return \Inertia\Inertia::render('Purchasing/vendors/AuditShow', [
            'audit' => $audit,
            'defaultCriteria' => VendorAudit::getDefaultCriteria(),
        ]);
    }

    public function update(Request $request, VendorAudit $audit)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:scheduled,in_progress,completed'],
            'criteria_scores' => ['nullable', 'array'],
            'score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'findings' => ['nullable', 'string'],
            'recommendations' => ['nullable', 'string'],
            'next_audit_date' => ['nullable', 'date'],
        ]);

        $audit->update($validated);

        return redirect()->back()->with('success', 'Audit updated successfully.');
    }
}
