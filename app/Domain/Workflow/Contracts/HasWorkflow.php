<?php

namespace App\Domain\Workflow\Contracts;

interface HasWorkflow
{
    /**
     * Callback when the workflow is fully approved.
     */
    public function onWorkflowApproved(): void;

    /**
     * Callback when the workflow is rejected.
     */
    public function onWorkflowRejected(string $reason): void;
}
