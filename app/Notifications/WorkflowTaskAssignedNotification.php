<?php

namespace App\Notifications;

use App\Models\ApprovalTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkflowTaskAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ApprovalTask $task
    ) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $workflow = $this->task->workflowInstance->workflow;
        $step = $this->task->workflowStep;
        $entity = $this->task->workflowInstance->entity;

        return (new MailMessage)
            ->subject("New Approval Task: {$workflow->name}")
            ->greeting("Hello {$notifiable->name},")
            ->line('You have been assigned a new approval task.')
            ->line("**Workflow**: {$workflow->name}")
            ->line("**Step**: {$step->name}")
            ->line('**Entity**: '.($entity->document_number ?? $entity->id))
            ->when($this->task->due_at, function ($mail) {
                $dueDate = $this->task->due_at->format('Y-m-d H:i');

                return $mail->line("**Due Date**: {$dueDate}");
            })
            ->action('View Task', url('/api/approval-tasks/'.$this->task->id))
            ->line('Please review and take action at your earliest convenience.');
    }

    public function toArray($notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'workflow_name' => $this->task->workflowInstance->workflow->name,
            'step_name' => $this->task->workflowStep->name,
            'due_at' => $this->task->due_at ? $this->task->due_at->toISOString() : null,
        ];
    }
}
