import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Send, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import WorkflowTimeline from '@/components/WorkflowTimeline';

// Manual routes placeholders
const indexUrl = '/purchasing/requests';
const destroyUrl = (id: number) => `/purchasing/requests/${id}`;
const submitUrl = (id: number) => `/purchasing/requests/${id}/submit`;
const convertUrl = (id: number) => `/purchasing/requests/${id}/convert`;

interface PurchaseRequest {
    id: number;
    document_number: string;
    date: string;
    required_date: string;
    status: string;
    notes: string;
    created_at: string;
    requester: {
        id: number;
        name: string;
    };
    items: Array<{
        id: number;
        quantity: number;
        estimated_unit_price: number;
        estimated_total: number;
        product: {
            name: string;
            code: string;
            uom: {
                name: string;
            }
        };
    }>;
}

interface Vendor {
    id: number;
    name: string;
}

export default function PurchaseRequestShow({ request, vendors, workflowInstance, pendingApprovalTask }: { request: PurchaseRequest; vendors: Vendor[]; workflowInstance: any; pendingApprovalTask: any }) {
    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState<string>("");
    const [processing, setProcessing] = useState(false);

    // Workflow states
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleDelete = () => {
        router.delete(destroyUrl(request.id), {
            onSuccess: () => toast.success('Purchase Request deleted successfully'),
            onError: () => toast.error('Failed to delete purchase request'),
        });
    };

    const handleSubmit = () => {
        router.post(submitUrl(request.id), {}, {
            onSuccess: () => toast.success('Purchase Request submitted for approval'),
            onError: (errors: any) => toast.error(errors.error || 'Failed to submit purchase request'),
        });
    };
    
    const handleConvert = () => {
        if (!selectedVendorId) {
            toast.error('Please select a vendor');
            return;
        }

        setProcessing(true);
        router.post(convertUrl(request.id), { vendor_id: selectedVendorId }, {
            onSuccess: () => {
                toast.success('Purchase Order created successfully');
                setConvertDialogOpen(false);
                setProcessing(false);
            },
            onError: (errors: any) => {
                toast.error(errors.error || 'Failed to convert purchase request');
                setProcessing(false);
            }
        });
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

    const getStatusBadge = (status: string) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        if (status === 'approved') variant = "default";
        if (status === 'rejected') variant = "destructive";
        if (status === 'submitted') variant = "secondary";
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Requests', href: indexUrl },
            { title: request.document_number, href: '#' }
        ]}>
            <Head title={request.document_number} />

            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={indexUrl}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{request.document_number}</h1>
                        <p className="text-muted-foreground">Requested by {request.requester?.name}</p>
                    </div>
                    <div className="flex gap-2">
                         {request.status === 'draft' && (
                            <>
                                <DeleteConfirmDialog
                                    trigger={
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    }
                                    onConfirm={handleDelete}
                                    title="Delete Purchase Request"
                                    description="Are you sure you want to delete this? This action cannot be undone."
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

                        {request.status === 'approved' && (
                            <Button size="sm" onClick={() => setConvertDialogOpen(true)}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Convert to PO
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                             <div className="flex items-center justify-between">
                                <CardTitle>Request Details</CardTitle>
                                {getStatusBadge(request.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                             <div>
                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                <p className="mt-1">{new Date(request.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Required Date</p>
                                <p className="mt-1">{request.required_date ? new Date(request.required_date).toLocaleDateString() : '-'}</p>
                            </div>
                            {request.notes && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm">{request.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">UOM</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Est. Price</TableHead>
                                        <TableHead className="text-right">Est. Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {request.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.product.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.product.code}</div>
                                            </TableCell>
                                            <TableCell className="text-center">{item.product.uom?.name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.estimated_unit_price)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.estimated_total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <WorkflowTimeline workflowInstance={workflowInstance} />
                </div>
            </div>

            {/* Convert to PO Dialog */}
            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convert to Purchase Order</DialogTitle>
                        <DialogDescription>
                            Select a vendor to create a Purchase Order from this request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="vendor">Vendor</Label>
                            <Select 
                                value={selectedVendorId} 
                                onValueChange={setSelectedVendorId}
                            >
                                <SelectTrigger id="vendor">
                                    <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                            {vendor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConvert} disabled={processing || !selectedVendorId}>
                            {processing ? 'Converting...' : 'Create Purchase Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Purchase Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this purchase request? This will move the workflow to the next step.
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
                        <DialogTitle>Reject Purchase Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this purchase request. This will be recorded in the audit log.
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
