import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { index, post } from '@/routes/purchasing/receipts';
import { create as createBill } from '@/routes/accounting/bills';
import { show as showPo } from '@/routes/purchasing/orders';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import LandedCostPanel from './components/LandedCostPanel';
import QcInspectionPanel from './components/QcInspectionPanel';
import DocumentFlow from '@/components/DocumentFlow';

interface Props {
    receipt: any;
    qc_summary: any;
}

export default function GoodsReceiptShow({ receipt, qc_summary }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleConfirmPost = () => {
        setProcessing(true);
        router.post(post.url(receipt.id), {}, {
            onSuccess: () => {
                toast.success('Receipt posted successfully.');
                setConfirmOpen(false);
                setProcessing(false);
            },
            onError: () => {
                toast.error('Failed to post receipt.');
                setProcessing(false);
            },
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'posted': return 'default';
            case 'draft': return 'secondary';
            case 'received': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    const isPosted = receipt.status === 'posted';

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' }, 
            { title: 'Goods Receipts', href: index.url() },
            { title: receipt.receipt_number, href: '#' }
        ]}>
            <Head title={`Receipt ${receipt.receipt_number}`} />
            
            <PageHeader
                title={receipt.receipt_number}
                description={`Goods Receipt for ${receipt.purchase_order?.vendor?.name}`}
            >
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    
                    {receipt.status === 'draft' && (
                        <Button onClick={() => setConfirmOpen(true)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Post Receipt
                        </Button>
                    )}
                    
                    {receipt.status === 'posted' && (!receipt.purchase_order.vendor_bills || receipt.purchase_order.vendor_bills.length === 0) && (
                        <Button asChild>
                            <Link href={createBill.url({ query: { purchase_order_id: receipt.purchase_order_id } })}>
                                <FileText className="mr-2 h-4 w-4" /> Create Bill
                            </Link>
                        </Button>
                    )}
                </div>
            </PageHeader>

            <DocumentFlow type="gr" id={receipt.id} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Receipt Items</CardTitle>
                                    <CardDescription>Items received in this transaction</CardDescription>
                                </div>
                                <Badge variant={getStatusBadgeVariant(receipt.status) as any} className="capitalize">
                                    {receipt.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <table className="min-w-full divide-y divide-border">
                                        <thead>
                                            <tr className="bg-muted/50">
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Qty Received</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Remaining (PO)</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {receipt.items.map((item: any) => {
                                                const poItem = receipt.purchase_order?.items?.find((pi: any) => pi.product_id === item.product_id);
                                                const remaining = poItem ? poItem.quantity - poItem.quantity_received : 0;
                                                return (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="font-medium">{item.product.name}</div>
                                                            <div className="text-muted-foreground text-xs">{item.product.code}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right">
                                                            {Number(item.quantity_received).toFixed(2)} {item.uom.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                                                            {remaining > 0 ? Number(remaining).toFixed(2) : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                                            {item.notes || '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        {receipt.status === 'posted' && (
                                            <tfoot>
                                                <tr className="bg-muted/50">
                                                    <td colSpan={3} className="px-4 py-2 text-xs text-center text-muted-foreground">
                                                        Inventory updated at {new Date(receipt.updated_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* QC Inspection Panel */}
                        <QcInspectionPanel 
                            receiptId={receipt.id}
                            items={receipt.items}
                            isPosted={isPosted}
                        />

                         {receipt.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap">{receipt.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Receipt Number</div>
                                    <div>{receipt.receipt_number}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Date</div>
                                    <div>{new Date(receipt.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Warehouse</div>
                                    <div>{receipt.warehouse?.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Received By</div>
                                    <div>{receipt.received_by?.name || '-'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Related PO</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">PO Number</div>
                                    <Link href={showPo.url(receipt.purchase_order_id)} className="text-primary hover:underline">
                                        {receipt.purchase_order?.document_number}
                                    </Link>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Vendor</div>
                                    <div>{receipt.purchase_order?.vendor?.name}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Landed Cost Panel */}
                        <LandedCostPanel 
                            receiptId={receipt.id} 
                            landedCosts={receipt.landed_costs || []}
                            isPosted={isPosted}
                        />
                    </div>
                </div>

                 <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Post Goods Receipt</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to post this receipt? This will update inventory levels and cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmPost} disabled={processing}>
                                {processing ? 'Posting...' : 'Confirm Post'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </AppLayout>
    );
}
