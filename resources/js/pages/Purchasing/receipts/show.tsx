import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { index, post } from '@/routes/purchasing/receipts';
import { show as showPo } from '@/routes/purchasing/orders';

interface Props {
    receipt: any;
}

export default function GoodsReceiptShow({ receipt }: Props) {
    const handlePost = () => {
        if (!confirm('Are you sure you want to post this receipt? This will update inventory levels and cannot be undone.')) {
            return;
        }

        router.post(post.url(receipt.id), {}, {
            onSuccess: () => toast.success('Receipt posted successfully.'),
            onError: () => toast.error('Failed to post receipt.'),
        });
    };

    const colors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-800",
        posted: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' }, 
            { title: 'Goods Receipts', href: '/purchasing/receipts' },
            { title: receipt.receipt_number, href: '#' }
        ]}>
            <Head title={`Receipt ${receipt.receipt_number}`} />
            
            <div className="max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Receipts
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                         {receipt.status === 'draft' && (
                            <Button onClick={handlePost}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Post Receipt
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Receipt Items</CardTitle>
                                        <CardDescription>Items received in this transaction</CardDescription>
                                    </div>
                                    <Badge variant="outline" className={`capitalize ${colors[receipt.status] || ''}`}>
                                        {receipt.status}
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
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {receipt.items.map((item: any) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="font-medium">{item.product.name}</div>
                                                        <div className="text-muted-foreground text-xs">{item.product.code}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right">
                                                        {Number(item.quantity_received).toFixed(2)} {item.uom.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {item.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
