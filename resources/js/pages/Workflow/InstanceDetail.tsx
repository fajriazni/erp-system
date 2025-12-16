import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ExternalLink, Activity, Ban, AlertTriangle } from 'lucide-react';
import WorkflowTimeline from '@/components/WorkflowTimeline';
import { useState } from 'react';
import { toast } from 'sonner';

export default function InstanceDetail({ instance }: { instance: any }) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    const handleCancel = () => {
        post(`/workflows/instances/${instance.id}/cancel`, {
            onSuccess: () => {
                setCancelDialogOpen(false);
                reset();
                toast.success('Workflow cancelled successfully');
            },
            onError: () => {
                toast.error('Failed to cancel workflow');
            },
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    return (
        <AppLayout>
            <Head title={`Workflow #${instance.id}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/workflows/instances">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Workflow #{instance.id}
                                <Badge variant="outline">{instance.status}</Badge>
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {instance.workflow.name}
                            </p>
                        </div>
                    </div>

                    {instance.status === 'active' && (
                        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Cancel Workflow
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cancel Workflow</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to force cancel this workflow? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Cancellation Reason</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Why are you cancelling this workflow?"
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                        />
                                        {errors.reason && (
                                            <p className="text-sm text-destructive">{errors.reason}</p>
                                        )}
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md flex items-start gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
                                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                        <p>
                                            Cancelling this workflow will mark all pending tasks as cancelled and stop the approval process immediately.
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCancelDialogOpen(false)}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancel}
                                        disabled={processing}
                                    >
                                        {processing ? 'Cancelling...' : 'Confirm Cancel'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Metadata & Audit Log */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Entity Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Related Document
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                                        <dd className="text-sm font-mono mt-1">{instance.entity_type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Document ID</dt>
                                        <dd className="text-sm font-mono mt-1">#{instance.entity_id}</dd>
                                    </div>
                                    {instance.entity && (
                                        <>
                                            <div className="col-span-1 sm:col-span-2">
                                                 <Separator className="my-2" />
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-muted-foreground">Document Number</dt>
                                                <dd className="text-sm font-semibold mt-1">
                                                    {instance.entity.document_number || 'N/A'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                                                <dd className="text-sm mt-1">
                                                    {formatDate(instance.entity.created_at)}
                                                </dd>
                                            </div>
                                            {instance.entity.total_amount !== undefined && (
                                                <div>
                                                    <dt className="text-sm font-medium text-muted-foreground">Total Amount</dt>
                                                    <dd className="text-sm font-semibold mt-1">
                                                        {new Intl.NumberFormat('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR'
                                                        }).format(instance.entity.total_amount)}
                                                    </dd>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </dl>
                                
                                <div className="mt-6">
                                    {/* Link to Entity - Dynamic based on type */}
                                    {instance.entity_type === 'App\\Models\\PurchaseOrder' && (
                                        <Button variant="outline" className="w-full sm:w-auto" asChild>
                                            <Link href={`/purchasing/orders/${instance.entity_id}`}>
                                                View Purchase Order <ExternalLink className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Audit Log</CardTitle>
                                <CardDescription>History of all actions taken on this workflow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Changes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {instance.audit_logs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    No audit logs found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            instance.audit_logs.map((log: any) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="whitespace-nowrap text-xs">
                                                        {formatDate(log.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {log.user?.name || 'System'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {log.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                         {log.metadata ? JSON.stringify(log.metadata) : '-'}
                                                         {log.from_status && log.to_status && (
                                                             <span className="block">
                                                                 {log.from_status} → {log.to_status}
                                                             </span>
                                                         )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Timeline */}
                    <div>
                        <WorkflowTimeline workflowInstance={instance} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
