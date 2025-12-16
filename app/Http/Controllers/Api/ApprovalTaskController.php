<?php

namespace App\Http\Controllers\Api;

use App\Domain\Workflow\Services\ApprovalService;
use App\Http\Controllers\Controller;
use App\Models\ApprovalTask;
use Illuminate\Http\Request;

class ApprovalTaskController extends Controller
{
    public function __construct(
        protected ApprovalService $approvalService
    ) {}

    /**
     * Get pending approval tasks for current user
     */
    public function myApprovals(Request $request)
    {
        $user = $request->user();

        // Get tasks assigned to user
        $userTasks = $this->approvalService->getPendingTasksForUser($user->id);

        // Get tasks assigned to user's roles
        $roleTasks = collect();
        foreach ($user->roles as $role) {
            $roleTasks = $roleTasks->merge(
                $this->approvalService->getPendingTasksForRole($role->id)
            );
        }

        $tasks = $userTasks->merge($roleTasks)->unique('id');

        return response()->json([
            'data' => $tasks,
        ]);
    }

    /**
     * Approve an approval task
     */
    public function approve(Request $request, ApprovalTask $task)
    {
        $request->validate([
            'comments' => 'nullable|string|max:1000',
        ]);

        $this->approvalService->approve(
            $task,
            $request->user()->id,
            $request->input('comments')
        );

        return response()->json([
            'message' => 'Task approved successfully',
        ]);
    }

    /**
     * Reject an approval task
     */
    public function reject(Request $request, ApprovalTask $task)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
            'comments' => 'nullable|string|max:1000',
        ]);

        $this->approvalService->reject(
            $task,
            $request->user()->id,
            $request->input('reason'),
            $request->input('comments')
        );

        return response()->json([
            'message' => 'Task rejected successfully',
        ]);
    }

    /**
     * Delegate an approval task
     */
    public function delegate(Request $request, ApprovalTask $task)
    {
        $request->validate([
            'delegate_to_user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $this->approvalService->delegate(
            $task,
            $request->input('delegate_to_user_id'),
            $request->user()->id,
            $request->input('reason')
        );

        return response()->json([
            'message' => 'Task delegated successfully',
        ]);
    }
    /**
     * Get users for delegation
     */
    public function users(Request $request)
    {
        $search = $request->input('search');

        return \App\Models\User::where('id', '!=', $request->user()->id)
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email']);
    }
}
