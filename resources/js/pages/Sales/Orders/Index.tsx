import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Placeholder for Wayfinder import - will verify after generation
// import { create, show } from '@/routes/sales/orders';

interface SalesOrder {
    id: number;
    document_number: string;
    customer: { name: string };
    warehouse: { name: string };
    date: string;
    status: string;
    total_amount: number;
    currency: string;
}

interface Props {
    orders: {
        data: SalesOrder[];
        links: any[];
    };
}

export default function Index({ orders }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Sales', href: '/sales' },
            { title: 'Orders', href: '/sales/orders' },
        ]}>
            <Head title="Sales Orders" />

            <div className="container mx-auto p-6 space-y-6">
                <PageHeader 
                    title="Sales Orders" 
                    description="Manage customer orders and fulfillment status."
                >
                    <Button asChild>
                        <Link href="/sales/orders/create">
                            <Plus className="mr-2 h-4 w-4" /> New Order
                        </Link>
                    </Button>
                </PageHeader>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Orders</CardTitle>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                           <Input placeholder="Search orders..." className="h-9" />
                           <Button size="sm" variant="ghost"><Search className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
                                <p>No sales orders found.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.document_number}</TableCell>
                                            <TableCell>{order.customer?.name}</TableCell>
                                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{order.warehouse?.name}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: order.currency || 'IDR' }).format(order.total_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/sales/orders/${order.id}`}>View</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
