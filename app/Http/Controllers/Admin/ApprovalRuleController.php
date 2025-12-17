<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApprovalRule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ApprovalRuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $rules = ApprovalRule::with(['role', 'user'])
            ->orderBy('entity_type')
            ->orderBy('level')
            ->orderBy('min_amount')
            ->get();

        return Inertia::render('Admin/approval-rules/index', [
            'rules' => $rules,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/approval-rules/form', [
            'rule' => null,
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
            'entityTypes' => $this->getEntityTypes(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'entity_type' => 'required|string|in:purchase_request,purchase_order,expense,vendor_bill',
            'min_amount' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'role_id' => 'nullable|exists:roles,id',
            'user_id' => 'nullable|exists:users,id',
            'level' => 'required|integer|min:1|max:10',
            'is_active' => 'boolean',
        ]);

        // Either role_id or user_id must be set
        if (empty($validated['role_id']) && empty($validated['user_id'])) {
            return back()->withErrors(['role_id' => 'Either role or user must be selected.']);
        }

        ApprovalRule::create($validated);

        return redirect()->route('admin.approval-rules.index')
            ->with('success', 'Approval rule created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ApprovalRule $approvalRule): Response
    {
        return Inertia::render('Admin/approval-rules/form', [
            'rule' => $approvalRule,
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
            'entityTypes' => $this->getEntityTypes(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ApprovalRule $approvalRule): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'entity_type' => 'required|string|in:purchase_request,purchase_order,expense,vendor_bill',
            'min_amount' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'role_id' => 'nullable|exists:roles,id',
            'user_id' => 'nullable|exists:users,id',
            'level' => 'required|integer|min:1|max:10',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['role_id']) && empty($validated['user_id'])) {
            return back()->withErrors(['role_id' => 'Either role or user must be selected.']);
        }

        $approvalRule->update($validated);

        return redirect()->route('admin.approval-rules.index')
            ->with('success', 'Approval rule updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ApprovalRule $approvalRule): RedirectResponse
    {
        $approvalRule->delete();

        return redirect()->route('admin.approval-rules.index')
            ->with('success', 'Approval rule deleted successfully.');
    }

    /**
     * Get available entity types for approval.
     */
    private function getEntityTypes(): array
    {
        return [
            ['value' => 'purchase_request', 'label' => 'Purchase Request'],
            ['value' => 'purchase_order', 'label' => 'Purchase Order'],
            ['value' => 'expense', 'label' => 'Expense'],
            ['value' => 'vendor_bill', 'label' => 'Vendor Bill'],
        ];
    }
}
