<?php

namespace App\Http\Controllers;

use App\Models\ApprovalTask;
use App\Models\Workflow;
use App\Models\WorkflowInstance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowManagementController extends Controller
{
    /**
     * Display workflow management dashboard
     */
    public function index(Request $request)
    {
        $query = Workflow::withCount(['instances', 'steps'])
            ->with('creator')
            ->latest();

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        $workflows = $query->get();

        return Inertia::render('Workflow/Management/Index', [
            'workflows' => $workflows,
            'filters' => $request->only(['module']),
        ]);
    }

    /**
     * Display workflow instances
     */
    public function instances(Request $request)
    {
        $query = WorkflowInstance::with([
            'workflow',
            'currentStep',
            'initiator',
            'approvalTasks' => function ($q) {
                $q->where('status', 'pending');
            },
        ]);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $instances = $query->latest()->paginate(20);

        return Inertia::render('Workflow/Management/Instances', [
            'instances' => $instances,
        ]);
    }

    /**
     * Display my approvals page
     */
    public function myApprovals(Request $request)
    {
        $user = $request->user();

        // Get user's pending tasks
        $tasks = ApprovalTask::query()
            ->where(function ($q) use ($user) {
                $q->where('assigned_to_user_id', $user->id)
                    ->orWhereHas('role', function ($roleQuery) use ($user) {
                        $roleQuery->whereIn('id', $user->roles->pluck('id'));
                    });
            })
            ->where('status', 'pending')
            ->with([
                'workflowInstance.workflow',
                'workflowInstance.entity',
                'workflowStep',
            ])
            ->orderBy('due_at')
            ->orderBy('created_at')
            ->paginate(20);

        return Inertia::render('Workflow/MyApprovals', [
            'tasks' => $tasks,
        ]);
    }
}
