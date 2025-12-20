<?php

namespace App\Http\Controllers;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Models\WorkflowInstance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowInstanceController extends Controller
{
    public function __construct(
        private WorkflowEngine $workflowEngine
    ) {}

    public function index(Request $request)
    {
        $query = WorkflowInstance::with([
            'workflow',
            'currentStep',
            'entity',
            'approvalTasks' => function ($q) {
                $q->where('status', 'pending')
                    ->with(['user', 'role']);
            },
        ]);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by entity type
        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('workflow', function ($wq) use ($request) {
                    $wq->where('name', 'like', "%{$request->search}%");
                })
                    ->orWhere('entity_id', 'like', "%{$request->search}%");
            });
        }

        // Sort
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $instances = $query->paginate(15)->withQueryString();

        return Inertia::render('Workflow/Instances', [
            'instances' => $instances,
            'filters' => $request->only(['status', 'entity_type', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function show(WorkflowInstance $instance)
    {
        $instance->load([
            'workflow',
            'currentStep',
            'entity',
            'approvalTasks' => function ($q) {
                $q->with(['user', 'role', 'workflowStep'])
                    ->orderBy('created_at', 'asc');
            },
            'auditLogs' => function ($q) {
                $q->with('user')
                    ->orderBy('created_at', 'desc');
            },
        ]);

        return Inertia::render('Workflow/InstanceDetail', [
            'instance' => $instance,
        ]);
    }

    public function cancel(WorkflowInstance $instance, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        // Only allow canceling active instances
        if ($instance->status !== 'active') {
            return back()->with('error', 'Only active instances can be cancelled');
        }

        // Check permission (admin or workflow owner)
        if (! auth()->user()->hasRole('Super Admin')) {
            return back()->with('error', 'You do not have permission to cancel this workflow');
        }

        // Update instance
        $instance->update([
            'status' => 'cancelled',
            'completed_at' => now(),
        ]);

        // Cancel all pending tasks
        $instance->approvalTasks()
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);

        // Log the cancellation
        $instance->auditLogs()->create([
            'action' => 'workflow_cancelled',
            'user_id' => auth()->id(),
            'metadata' => [
                'reason' => $request->reason,
            ],
        ]);

        return back()->with('success', 'Workflow instance cancelled successfully');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:workflow_instances,id',
            'action' => 'required|in:cancel',
            'reason' => 'required_if:action,cancel|string|nullable|max:500',
        ]);

        $ids = $request->ids;
        $action = $request->action;
        $count = 0;

        if ($action === 'cancel') {
            $instances = WorkflowInstance::whereIn('id', $ids)
                ->where('status', 'active')
                ->get();

            $engine = app(\App\Domain\Workflow\Services\WorkflowEngine::class);

            foreach ($instances as $instance) {
                // Check permission (admin or workflow owner)
                if (auth()->user()->hasRole('Super Admin')) {
                    $this->workflowEngine->cancelWorkflow($instance, auth()->id(), $request->input('reason', 'Bulk cancellation'));
                    $count++;
                }
            }
        }

        return back()->with('success', "$count workflow instances processed successfully");
    }
}
