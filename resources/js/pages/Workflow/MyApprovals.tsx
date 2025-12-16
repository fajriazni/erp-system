import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ArrowRight, ExternalLink, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DelegateDialog from './Components/DelegateDialog';

interface ApprovalTask {
    id: number;
    status: string;
    due_at: string | null;
    created_at: string;
    workflow_instance: {
        id: number;
        workflow: {
            name: string;
        };
        entity: any;
        entity_type: string;
    };
    workflow_step: {
        name: string;
    };
}

export default function MyApprovals() {
    const [tasks, setTasks] = useState<ApprovalTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [delegateDialogOpen, setDelegateDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);
    const [selectedDelegateTask, setSelectedDelegateTask] = useState<ApprovalTask | null>(null);
    const [comments, setComments] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('/api/my-approvals');
            setTasks(response.data.data);
        } catch (error) {
            console.error('Failed to fetch approvals', error);
            toast.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (task: ApprovalTask) => {
        setSelectedTask(task);
        setComments('');
        setApproveDialogOpen(true);
    };

    const handleReject = (task: ApprovalTask) => {
        setSelectedTask(task);
        setComments('');
        setRejectDialogOpen(true);
    };

    const handleDelegate = (task: ApprovalTask) => {
        setSelectedDelegateTask(task);
        setDelegateDialogOpen(true);
    };

    const confirmApprove = async () => {
        if (!selectedTask) return;

        try {
            setProcessing(true);
            await axios.post(`/api/approval-tasks/${selectedTask.id}/approve`, {
                comments: comments,
            });
            toast.success('Task approved successfully');
            setApproveDialogOpen(false);
            fetchTasks();
        } catch (error) {
            console.error('Failed to approve task', error);
            toast.error('Failed to approve task');
        } finally {
            setProcessing(false);
        }
    };

    const confirmReject = async () => {
        if (!selectedTask) return;

        try {
            setProcessing(true);
            await axios.post(`/api/approval-tasks/${selectedTask.id}/reject`, {
                reason: comments, // Using comments input as reason for simplicity
                comments: comments,
            });
            toast.success('Task rejected successfully');
            setRejectDialogOpen(false);
            fetchTasks();
        } catch (error) {
            console.error('Failed to reject task', error);
            toast.error('Failed to reject task');
        } finally {
            setProcessing(false);
        }
    };

    const getEntityUrl = (type: string, entity: any) => {
        // Map entity types to their show pages
        if (type.includes('PurchaseOrder')) {
            return `/purchasing/orders/${entity.id}`;
        }
        // Add other types as needed
        return '#';
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="My Approvals" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">My Approvals</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your pending approval tasks
                    </p>
                </div>

                {tasks.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">All caught up!</h3>
                            <p className="text-muted-foreground">
                                You have no pending approvals at the moment.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tasks.map((task) => (
                            <Card key={task.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2">
                                            {task.workflow_step.name}
                                        </Badge>
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Pending
                                        </Badge>
                                    </div>
                                    <div className="flex items-start justify-between">
                                          <div>
                                              <CardTitle className="text-base text-primary">
                                                  {task.workflow_instance.workflow.name}
                                              </CardTitle>
                                              <CardDescription className="font-mono text-xs mt-1">
                                                  {task.workflow_instance.entity?.document_number ||
                                                      `#${task.workflow_instance.entity?.id}`}
                                              </CardDescription>
                                          </div>
                                          
                                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                            <Link href={getEntityUrl(task.workflow_instance.entity_type, task.workflow_instance.entity)}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                          </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    <div className="space-y-4">
                                        
                                        {/* Transaction Details would accept different layouts based on entity type */}
                                        <div className="text-sm space-y-2 bg-muted/30 p-3 rounded-md">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Date:</span>
                                                <span className="font-medium">
                                                    {new Date(task.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {task.workflow_instance.entity?.total_amount && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Amount:</span>
                                                    <span className="font-medium">
                                                        {new Intl.NumberFormat('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR'
                                                        }).format(task.workflow_instance.entity.total_amount)}
                                                    </span>
                                                </div>
                                            )}
                                             {task.workflow_instance.entity?.vendor?.name && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Vendor:</span>
                                                    <span className="font-medium truncate max-w-[150px]" title={task.workflow_instance.entity.vendor.name}>
                                                        {task.workflow_instance.entity.vendor.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <Button 
                                            variant="outline" 
                                            className="w-full text-xs h-8" 
                                            asChild
                                        >
                                            <Link href={getEntityUrl(task.workflow_instance.entity_type, task.workflow_instance.entity)}>
                                               View Details
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelegate(task)}
                                            disabled={processing}
                                        >
                                            Delegate
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReject(task)}
                                            disabled={processing}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleApprove(task)}
                                            disabled={processing}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                
                {/* Approve Dialog */}
                <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Task</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to approve this task?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            <Label htmlFor="comments">Comments (Optional)</Label>
                            <Textarea
                                id="comments"
                                placeholder="Add any comments..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setApproveDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={confirmApprove} disabled={processing}>
                                {processing ? 'Approving...' : 'Confirm Approve'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Task</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejection.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            <Label htmlFor="reason">Reason (Required)</Label>
                            <Textarea
                                id="reason"
                                placeholder="Why are you rejecting this task?"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setRejectDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmReject}
                                disabled={processing || !comments.trim()}
                            >
                                {processing ? 'Rejecting...' : 'Confirm Reject'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                 {/* Delegate Dialog */}
                <DelegateDialog 
                    open={delegateDialogOpen} 
                    onOpenChange={setDelegateDialogOpen}
                    taskId={selectedDelegateTask?.id || null}
                    onSuccess={() => {
                        fetchTasks(); // Reload tasks instead of full page reload
                        setDelegateDialogOpen(false);
                    }}
                />
            </div>
        </AppLayout>
    );
}
