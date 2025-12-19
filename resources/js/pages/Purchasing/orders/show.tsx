
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Send, CheckCircle, XCircle, Printer } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { index, edit, destroy, submit, approve, cancel, print as printOrder } from '@/routes/purchasing/orders';
import { create } from '@/routes/accounting/bills';
import { create as createReceipt } from '@/routes/purchasing/receipts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import WorkflowTimeline from '@/components/WorkflowTimeline';
import { PageHeader } from '@/components/ui/page-header'; // Added import

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
        quantity_received: number;
        unit_price: number;
        subtotal: number;
    }>;
    goods_receipts?: Array<{
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

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Orders', href: index.url() },
            { title: order.document_number, href: '#' }
        ]}>
            <Head title={order.document_number} />

            <div className="container mx-auto space-y-6">
                <div>
                     <Button variant="ghost" asChild className="mb-2 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Purchase Orders
                        </Link>
                    </Button>

                    <PageHeader
                        title={order.document_number}
                        description={
                            <div className="flex items-center gap-2">
                                <span>Created on {formatDate(order.created_at)}</span>
                                <span className="text-muted-foreground">•</span>
                                {getStatusBadge(order.status)}
                            </div>
                        }
                    >
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a href={printOrder.url(order.id)} target="_blank" rel="noopener noreferrer">
                                    <Printer className="mr-2 h-4 w-4" /> Print
                                </a>
                            </Button>
                            
                            {/* Draft Actions */}
                            {order.status === 'draft' && (
                                <>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={edit.url(order.id)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Link>
                                    </Button>

                                    <DeleteConfirmDialog
                                        trigger={
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        }
                                        onConfirm={handleDelete}
                                        title="Delete Purchase Order"
                                        description="Are you sure you want to delete this purchase order? This action cannot be undone."
                                    />

                                    <Button size="sm" onClick={handleSubmit}>
                                        <Send className="mr-2 h-4 w-4" /> Submit
                                    </Button>
                                </>
                            )}

                            {/* Approval Actions */}
                            {pendingApprovalTask && (
                                <>
                                    <Button 
                                        size="sm" 
                                        variant="default"
                                        onClick={() => setApproveDialogOpen(true)}
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => setRejectDialogOpen(true)}
                                        disabled={processing}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </>
                            )}

                             {/* Cancel Action */}
                            {(order.status === 'pending' || order.status === 'submitted') && !pendingApprovalTask && (
                                <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                </Button>
                            )}

                            {/* Receive Goods */}
                            {['purchase_order', 'partial_received'].includes(order.status) && (
                                <Button variant="default" size="sm" asChild>
                                    <Link href={createReceipt.url({ query: { po_id: order.id } })}>
                                        Receive Goods
                                    </Link>
                                </Button>
                            )}

                            {/* Create Bill */}
                            {['purchase_order', 'partial_received', 'completed'].includes(order.status) && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={create.url({ query: { purchase_order_id: order.id } })}>
                                        Create Bill
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </PageHeader>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Vendor</dt>
                                        <dd className="font-medium text-base">{order.vendor?.name || '-'}</dd>
                                        {order.vendor?.email && (
                                            <dd className="text-sm text-muted-foreground">{order.vendor.email}</dd>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Warehouse</dt>
                                        <dd className="font-medium text-base">{order.warehouse?.name || '-'}</dd>
                                    </div>
                                    {order.notes && (
                                        <div className="col-span-2 space-y-1 pt-2 border-t">
                                            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                                            <dd className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md mt-1">{order.notes}</dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                             <CardHeader className="bg-muted/50 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <CardTitle className="text-base">Items</CardTitle>
                                        <span className="text-sm text-muted-foreground">({order.items?.length || 0})</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">Product</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Received</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right pr-6">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium pl-6">{item.description || '-'}</TableCell>
                                                    <TableCell className="text-right">{Number(item.quantity).toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={Number(item.quantity_received) >= Number(item.quantity) ? 'default' : 'secondary'} className="font-mono font-normal">
                                                            {Number(item.quantity_received).toFixed(2)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                                    <TableCell className="text-right font-medium pr-6">{formatCurrency(item.subtotal)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    No items found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="flex justify-end p-6 bg-muted/10">
                                    <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">{formatCurrency(order.subtotal || order.total)}</span>
                                        </div>
                                        {(order.tax_rate ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">PPN ({order.tax_rate}%)</span>
                                                <span className="font-medium text-green-600">+{formatCurrency(order.tax_amount || 0)}</span>
                                            </div>
                                        )}
                                        {(order.withholding_tax_rate ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">PPh 23 ({order.withholding_tax_rate}%)</span>
                                                <span className="font-medium text-red-600">-{formatCurrency(order.withholding_tax_amount || 0)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                                            <span>Total</span>
                                            <span>{formatCurrency(order.total)}</span>
                                        </div>
                                         {(order.withholding_tax_rate ?? 0) > 0 && (
                                             <div className="flex justify-between text-sm font-medium text-muted-foreground mt-1">
                                                <span>Net Payable</span>
                                                <span>{formatCurrency((order.total || 0) - (order.withholding_tax_amount || 0))}</span>
                                            </div>
                                         )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Goods Receipts */}
                        {order.goods_receipts && order.goods_receipts.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Related Goods Receipts</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="pl-6">Receipt #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right pr-6">Total Qty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.goods_receipts.map((receipt) => (
                                                <TableRow key={receipt.id}>
                                                    <TableCell className="font-medium pl-6">
                                                        <Link href={`/purchasing/receipts/${receipt.id}/edit`} className="hover:underline text-primary font-medium">
                                                            {receipt.receipt_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{formatDate(receipt.date)}</TableCell>
                                                    <TableCell><Badge variant="outline">{receipt.status}</Badge></TableCell>
                                                    <TableCell className="text-right pr-6">
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

                    <div className="lg:col-span-1 space-y-6">
                         {/* Workflow Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Workflow Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {workflowInstance ? (
                                    <WorkflowTimeline workflowInstance={workflowInstance} />
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground text-sm">
                                        Workflow will appear after order submission.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
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
                        <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
                            {processing ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
