import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SalesOrder {
    id: number;
    document_number: string;
    customer: { name: string };
    warehouse: { name: string };
    date: string;
    status: string;
    total_amount: number;
    currency: string;
    items: any[];
}

interface Props {
    order: SalesOrder;
}

export default function Show({ order }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Sales', href: '/sales' },
            { title: 'Orders', href: '/sales/orders' },
            { title: order.document_number, href: '#' },
        ]}>
            <Head title={`Sales Order ${order.document_number}`} />

            <div className="container mx-auto p-6 space-y-6">
                <PageHeader 
                    title={`Order ${order.document_number}`}
                    description={`Created on ${new Date(order.date).toLocaleDateString()}`}
                    backUrl="/sales/orders"
                >
                    <div className="flex gap-2">
                        <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'} className="text-lg">
                            {order.status.toUpperCase()}
                        </Badge>
                        {/* Add Confirm Button here later */}
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Customer Name</div>
                                <div className="font-medium">{order.customer.name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Warehouse</div>
                                <div className="font-medium">{order.warehouse.name}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.product.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.product.code}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('id-ID').format(item.unit_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: order.currency || 'IDR' }).format(item.quantity * item.unit_price)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                        <TableCell className="text-right font-bold">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: order.currency || 'IDR' }).format(order.total_amount)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
