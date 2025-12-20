import { index as receiptsIndex } from '@/routes/purchasing/receipts';
import { index as ordersIndex } from '@/routes/purchasing/orders';
import { show as showOrder } from '@/routes/purchasing/orders';
import { show as showReceipt } from '@/routes/purchasing/receipts';

import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import VendorScorecard from './components/VendorScorecard';
import { index, edit } from '@/routes/purchasing/vendors';
import { useCurrency } from '@/hooks/use-currency';

interface Props {
    vendor: any;
    recentOrders: any[];
    recentReceipts: any[];
    performance: {
        totalOrders: number;
        totalSpent: number;
        avgOrderValue: number;
    };
}

export default function VendorShow({ vendor, recentOrders, recentReceipts, performance }: Props) {
    const formatCurrency = (amount: number) => {
        return useCurrency().format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { className: string; label: string }> = {
            draft: { className: 'bg-gray-100 text-gray-800', label: 'Draft' },
            pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            approved: { className: 'bg-blue-100 text-blue-800', label: 'Approved' },
            completed: { className: 'bg-green-100 text-green-800', label: 'Completed' },
            cancelled: { className: 'bg-red-100 text-red-800', label: 'Cancelled' },
            posted: { className: 'bg-green-100 text-green-800', label: 'Posted' },
        };
        const config = variants[status] || { className: 'bg-gray-100 text-gray-800', label: status };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Vendors', href: '/purchasing/vendors' },
            { title: vendor.name, href: '#' }
        ]}>
            <Head title={`Vendor: ${vendor.name}`} />

            <div>
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={edit.url(vendor.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Vendor
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                                    <div>{vendor.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                                    <div>{vendor.email || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                    <div>{vendor.phone || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Address</div>
                                    <div className="whitespace-pre-wrap">{vendor.address || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Tax ID</div>
                                    <div>{vendor.tax_id || '-'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4" />
                                    Business Summary
                                </CardTitle>
                                <CardDescription>Transaction overview with this vendor</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">Orders</div>
                                        <div className="text-xl font-bold text-blue-600">{performance.totalOrders}</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg col-span-2">
                                        <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                                        <div className="text-xl font-bold text-green-600">{formatCurrency(performance.totalSpent)}</div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">Avg Order Value</div>
                                    <div className="text-lg font-semibold text-amber-600">{formatCurrency(performance.avgOrderValue)}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <VendorScorecard vendor={vendor} />
                    </div>

                    {/* Right Column - Transaction History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4" />
                                            Recent Orders
                                        </CardTitle>
                                        <CardDescription>Last 5 purchase orders</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={ordersIndex.url()}>View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentOrders.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentOrders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell>
                                                        <Link href={showOrder.url(order.id)} className="text-primary hover:underline font-medium">
                                                            {order.document_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{formatDate(order.date)}</TableCell>
                                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell className="text-right font-mono">{formatCurrency(order.total)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No orders found for this vendor.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Receipts */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Recent Receipts
                                        </CardTitle>
                                        <CardDescription>Last 5 goods receipts</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={receiptsIndex.url()}>View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentReceipts.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Receipt #</TableHead>
                                                <TableHead>PO #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentReceipts.map((receipt) => (
                                                <TableRow key={receipt.id}>
                                                    <TableCell>
                                                        <Link href={showReceipt.url(receipt.id)} className="text-primary hover:underline font-medium">
                                                            {receipt.receipt_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {receipt.purchase_order?.order_number || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{formatDate(receipt.date)}</TableCell>
                                                    <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No receipts found for this vendor.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
