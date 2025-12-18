import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Send, CheckCircle, XCircle, Printer, Pencil } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { edit, destroy, submit, approve, cancel } from '@/routes/purchasing/orders';
import { create } from '@/routes/accounting/bills';
import { create as createReceipt } from '@/routes/purchasing/receipts';
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
    subtotal?: number;
    tax_rate?: number;
    tax_amount?: number;
    withholding_tax_rate?: number;
    withholding_tax_amount?: number;
    tax_inclusive?: boolean;
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
        quantity_received: number; // Added
        unit_price: number;
        subtotal: number;
    }>;
    goods_receipts?: Array<{ // Added
        id: number;
        receipt_number: string;
        date: string;
        status: string;
        items: Array<{ id: number; quantity_received: number; }>;
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

            <div>
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
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/purchasing/orders/${order.id}/print`} target="_blank" rel="noopener noreferrer">
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </a>
                        </Button>
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


                        {/* Create Goods Receipt Button */}
                        {['purchase_order', 'partial_received'].includes(order.status) && (
                             <Button variant="default" size="sm" asChild>
                                <Link href={createReceipt.url({ query: { po_id: order.id } })}>
                                    Receive Goods
                                </Link>
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

            {/* Main Content - 2 Column Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column - Main content (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Information */}
                    <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Order Information</CardTitle>
                            {getStatusBadge(order.status)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <dt className="text-sm font-medium text-muted-foreground">Vendor</dt>
                                <dd className="font-medium">{order.vendor?.name || '-'}</dd>
                                {order.vendor?.email && (
                                    <dd className="text-sm text-muted-foreground">{order.vendor.email}</dd>
                                )}
                            </div>
                            <div className="space-y-1">
                                <dt className="text-sm font-medium text-muted-foreground">Warehouse</dt>
                                <dd className="font-medium">{order.warehouse?.name || '-'}</dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-sm font-medium text-muted-foreground">Order Date</dt>
                                <dd className="font-medium">{formatDate(order.date)}</dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-sm font-medium text-muted-foreground">Total Amount</dt>
                                <dd className="text-lg font-bold">{formatCurrency(order.total)}</dd>
                            </div>
                            {order.notes && (
                                <div className="col-span-2 md:col-span-4 space-y-1">
                                    <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                                    <dd className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">{order.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                    <CardHeader className="bg-muted/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Order Items</CardTitle>
                                <CardDescription className="mt-1">
                                    {order.items?.length || 0} item(s) | Total: {formatCurrency(order.total)}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Received</TableHead>
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
                                            <TableCell className="text-right">
                                                <Badge variant={Number(item.quantity_received) >= Number(item.quantity) ? 'default' : 'secondary'}>
                                                    {Number(item.quantity_received).toFixed(2)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No items found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex justify-end pt-4 border-t mt-4">
                            <div className="w-80 space-y-2 text-right">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-mono">{formatCurrency(order.subtotal || order.total)}</span>
                                </div>
                                {(order.tax_rate ?? 0) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">PPN {order.tax_rate}%:</span>
                                        <span className="font-mono text-green-600">+{formatCurrency(order.tax_amount || 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span className="font-mono">{formatCurrency(order.total)}</span>
                                </div>
                                {(order.withholding_tax_rate ?? 0) > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm text-red-600">
                                            <span>PPh 23 {order.withholding_tax_rate}%:</span>
                                            <span className="font-mono">-{formatCurrency(order.withholding_tax_amount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-primary border-t pt-2">
                                            <span>Net Payable:</span>
                                            <span className="font-mono">{formatCurrency((order.total || 0) - (order.withholding_tax_amount || 0))}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {order.goods_receipts && order.goods_receipts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Goods Receipts</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Receipt #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.goods_receipts.map((receipt) => (
                                        <TableRow key={receipt.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/purchasing/receipts/${receipt.id}/edit`} className="hover:underline text-primary">
                                                    {receipt.receipt_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{formatDate(receipt.date)}</TableCell>
                                            <TableCell><Badge variant="outline">{receipt.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                {receipt.items?.reduce((sum, item) => sum + Number(item.quantity_received || 0), 0) || 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
                </div>

                {/* Right Sidebar - Workflow Timeline */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Workflow Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {workflowInstance ? (
                                <WorkflowTimeline workflowInstance={workflowInstance} />
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-muted-foreground text-sm space-y-1">
                                        <p className="font-medium">No workflow data yet</p>
                                        <p className="text-xs">Workflow will appear after order submission</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
