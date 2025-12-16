<?php

namespace App\Http\Controllers\Api;

use App\Domain\Workflow\Services\WorkflowEngine;
use App\Domain\Workflow\Services\WorkflowInstanceService;
use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\WorkflowInstance;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    public function __construct(
        protected WorkflowEngine $workflowEngine,
        protected WorkflowInstanceService $instanceService
    ) {}

    /**
     * Get all workflows
     */
    public function index()
    {
        $workflows = Workflow::with('steps')->where('is_active', true)->get();

        return response()->json(['data' => $workflows]);
    }

    /**
     * Start a workflow for an entity
     */
    public function start(Request $request)
    {
        $request->validate([
            'workflow_id' => 'required|exists:workflows,id',
            'entity_type' => 'required|string',
            'entity_id' => 'required|integer',
        ]);

        $workflow = Workflow::findOrFail($request->workflow_id);
        $entityClass = $request->entity_type;
        $entity = $entityClass::findOrFail($request->entity_id);

        $instance = $this->workflowEngine->startWorkflow(
            $workflow,
            $entity,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Workflow started successfully',
            'data' => $instance->load(['workflow', 'currentStep', 'approvalTasks']),
        ]);
    }

    /**
     * Cancel a workflow instance
     */
    public function cancel(Request $request, WorkflowInstance $instance)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $this->workflowEngine->cancelWorkflow(
            $instance,
            $request->user()->id,
            $request->reason
        );

        return response()->json([
            'message' => 'Workflow cancelled successfully',
        ]);
    }

    /**
     * Get workflow instance details
     */
    public function show(WorkflowInstance $instance)
    {
        return response()->json([
            'data' => $instance->load([
                'workflow.steps',
                'currentStep',
                'approvalTasks' => function ($query) {
                    $query->with(['user', 'role', 'workflowStep'])
                        ->orderBy('created_at', 'asc');
                },
                'auditLogs.user',
            ]),
        ]);
    }
}
