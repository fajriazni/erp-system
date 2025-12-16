import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Send, CheckCircle, XCircle } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { edit, destroy, submit, approve, cancel } from '@/routes/purchasing/orders';
import { create } from '@/routes/purchasing/bills';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import WorkflowTimeline from '@/components/WorkflowTimeline';

interface PurchaseOrder {
    id: number;
    document_number: string;
    date: string;
    status: string;
    total: number;
    notes: string;
    created_at: string;
    vendor: {
        id: number;
        name: string;
        email?: string;
    };
    warehouse: {
        id: number;
        name: string;
    };
    items: Array<{
        id: number;
        description: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
    }>;
}

export default function PurchaseOrderShow({ order, workflowInstance, pendingApprovalTask }: { order: PurchaseOrder; workflowInstance: any; pendingApprovalTask: any }) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            rfq_sent: { variant: 'default', label: 'RFQ Sent' },
            to_approve: { variant: 'default', label: 'To Approve' },
            purchase_order: { variant: 'default', label: 'Purchase Order' },
            locked: { variant: 'outline', label: 'Locked' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };

        const config = variants[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleDelete = () => {
        router.delete(destroy.url(order.id), {
            onSuccess: () => toast.success('Purchase order deleted successfully'),
            onError: () => toast.error('Failed to delete purchase order'),
        });
    };

    const handleSubmit = () => {
        router.post(submit.url(order.id), {}, {
            onSuccess: () => toast.success('Purchase order submitted successfully'),
            onError: (errors: any) => toast.error(errors.error || 'Failed to submit purchase order'),
        });
    };

    const handleCancelConfirm = () => {
        if (!cancelReason.trim()) {
            toast.error('Cancel reason is required');
            return;
        }

        router.post(cancel.url(order.id), 
            { reason: cancelReason },
            {
                onSuccess: () => {
                    toast.success('Purchase order cancelled successfully');
                    setCancelDialogOpen(false);
                    setCancelReason('');
                },
                onError: (errors: any) => toast.error(errors.error || 'Failed to cancel purchase order'),
            }
        );
    };

    const handleApprove = async () => {
        setProcessing(true);
        try {
            await axios.post(`/api/approval-tasks/${pendingApprovalTask.id}/approve`, {});
            toast.success('Approval task approved successfully');
            setApproveDialogOpen(false);
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve task');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Rejection reason is required');
            return;
        }

        setProcessing(true);
        try {
            await axios.post(`/api/approval-tasks/${pendingApprovalTask.id}/reject`, {
                reason: rejectReason
            });
            toast.success('Approval task rejected successfully');
            setRejectDialogOpen(false);
            setRejectReason('');
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject task');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const canEdit = order.status === 'draft';
    const canDelete = order.status === 'draft' || order.status === 'cancelled';
    const canSubmit = order.status ===  'draft';
    const canApprove = order.status === 'to_approve';
    const canCancel = !['locked', 'cancelled'].includes(order.status);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Orders', href: '/purchasing/orders' },
            { title: order.document_number, href: '#' }
        ]}>
            <Head title={order.document_number} />

            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/purchasing/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Purchase Orders
                    </Link>
                </Button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{order.document_number}</h1>
                        <p className="text-muted-foreground">Created on {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Draft: Edit/Delete/Submit */}
                        {order.status === 'draft' && (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={edit.url(order.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>

                                <DeleteConfirmDialog
                                    trigger={
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    }
                                    onConfirm={handleDelete}
                                    title="Delete Purchase Order"
                                    description="Are you sure you want to delete this purchase order? This action cannot be undone."
                                />

                                <Button size="sm" onClick={handleSubmit}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit for Approval
                                </Button>
                            </>
                        )}

                        {/* Approval Task: Approve/Reject */}
                        {pendingApprovalTask && (
                            <>
                                <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => setApproveDialogOpen(true)}
                                    disabled={processing}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => setRejectDialogOpen(true)}
                                    disabled={processing}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                            </>
                        )}

                        {/* Submitted/Pending: Cancel */}
                        {(order.status === 'pending' || order.status === 'submitted') && !pendingApprovalTask && (
                            <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setCancelDialogOpen(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                            </Button>

                        )}


                        {/* Create Bill Button */}
                        {['purchase_order', 'partial_received', 'completed'].includes(order.status) && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={create.url({ query: { purchase_order_id: order.id } })}>
                                    Create Bill
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column - Order details (spans 2 cols on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Order Information</CardTitle>
                                {getStatusBadge(order.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                                <p className="mt-1 font-medium">{order.vendor?.name || '-'}</p>
                                {order.vendor?.email && (
                                    <p className="text-sm text-muted-foreground">{order.vendor.email}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                                <p className="mt-1 font-medium">{order.warehouse?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                                <p className="mt-1">{formatDate(order.date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Document Number</p>
                                <p className="mt-1 font-mono font-medium">{order.document_number}</p>
                            </div>
                        {order.notes && (
                            <div className="sm:col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm">{order.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                        <CardDescription>{order.items?.length || 0} item(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.description || '-'}</TableCell>
                                            <TableCell className="text-right">{Number(item.quantity).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No items found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex justify-end pt-4 border-t mt-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{formatCurrency(order.total)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right column - Workflow Timeline */}
            <div className="lg:col-span-1">
                <WorkflowTimeline workflowInstance={workflowInstance} />
            </div>
        </div>

        {/* Cancel Dialog */}

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Purchase Order</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancelling this purchase order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Cancellation Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter reason for cancellation..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                            Close
                        </Button>
                        <Button variant="destructive" onClick={handleCancelConfirm} disabled={processing}>
                            Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Purchase Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this purchase order? This will move the workflow to the next step.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={processing}>
                            {processing ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Purchase Order</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this purchase order. This will be recorded in the audit log.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejectReason">Rejection Reason *</Label>
                            <Textarea
                                id="rejectReason"
                                placeholder="Enter your reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectReason.trim()}>
                            {processing ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
