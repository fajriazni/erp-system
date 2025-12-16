import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle, User } from 'lucide-react';

interface WorkflowInstance {
    id: number;
    status: string;
    initiated_at: string;
    completed_at: string | null;
    workflow: {
        name: string;
    };
    current_step: {
        name: string;
        step_number: number;
    } | null;
    approval_tasks: Array<{
        id: number;
        status: string;
        assigned_to_user_id: number | null;
        assigned_to_role_id: number | null;
        approved_at: string | null;
        rejected_at: string | null;
        due_at: string | null;
        user: { name: string } | null;
        role: { name: string } | null;
        workflow_step: {
            name: string;
            step_number: number;
        };
    }>;
    audit_logs: Array<{
        id: number;
        action: string;
        from_status: string | null;
        to_status: string | null;
        created_at: string;
        user: { name: string } | null;
    }>;
}

export default function WorkflowTimeline({ workflowInstance }: { workflowInstance: WorkflowInstance | null }) {
    if (!workflowInstance) {
        return null;
    }

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: any; icon: any; label: string }> = {
            pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
            approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
            rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
            cancelled: { variant: 'outline', icon: AlertCircle, label: 'Cancelled' },
        };

        const { variant, icon: Icon, label } = config[status] || config.pending;

        return (
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
                <Icon className="h-3 w-3" />
                {label}
            </Badge>
        );
    };

    const getTaskStatusBadge = (status: string) => {
        const config: Record<string, { variant: any; label: string }> = {
            pending: { variant: 'secondary', label: 'Pending' },
            approved: { variant: 'default', label: 'Approved' },
            rejected: { variant: 'destructive', label: 'Rejected' },
        };

        const { variant, label } = config[status] || config.pending;
        return <Badge variant={variant}>{label}</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Approval Workflow</CardTitle>
                        <CardDescription>{workflowInstance.workflow.name}</CardDescription>
                    </div>
                    {getStatusBadge(workflowInstance.status)}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Step */}
                {workflowInstance.current_step && workflowInstance.status === 'pending' && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">Current Step</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {workflowInstance.current_step.name} (Step {workflowInstance.current_step.step_number})
                        </p>
                    </div>
                )}

                {/* Approval Tasks Timeline */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Approval History</h4>
                    <div className="relative space-y-4 pl-6 border-l-2 border-border">
                        {workflowInstance.approval_tasks.map((task, index) => (
                            <div key={task.id} className="relative pb-4 last:pb-0">
                                {/* Timeline dot */}
                                <div
                                    className={`absolute -left-[1.6rem] w-3 h-3 rounded-full border-2 ${
                                        task.status === 'approved'
                                            ? 'bg-green-500 border-green-500'
                                            : task.status === 'rejected'
                                            ? 'bg-red-500 border-red-500'
                                            : 'bg-background border-border'
                                    }`}
                                />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-sm">{task.workflow_step.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {task.user?.name || task.role?.name || 'Unassigned'}
                                            </p>
                                        </div>
                                        {getTaskStatusBadge(task.status)}
                                    </div>

                                    {task.approved_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Approved: {new Date(task.approved_at).toLocaleString()}
                                        </p>
                                    )}

                                    {task.rejected_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Rejected: {new Date(task.rejected_at).toLocaleString()}
                                        </p>
                                    )}

                                    {task.status === 'pending' && task.due_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Due: {new Date(task.due_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workflow Completion */}
                {workflowInstance.completed_at && (
                    <div className="rounded-lg border p-4 bg-muted/30">
                        <div className="flex items-center gap-2">
                            {workflowInstance.status === 'approved' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                                Workflow {workflowInstance.status === 'approved' ? 'Completed' : 'Ended'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(workflowInstance.completed_at).toLocaleString()}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
