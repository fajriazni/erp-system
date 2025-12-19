import { Head, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScanBarcode, Package, CheckCircle } from 'lucide-react';

interface DeliveryOrderLine {
    id: number;
    product: {
        name: string;
        code: string;
    };
    quantity_ordered: number;
    quantity_done: number;
}

interface DeliveryOrder {
    id: number;
    delivery_number: string;
    date: string;
    status: string;
    sales_order?: {
        document_number: string;
        customer?: {
            name: string;
        };
    };
    warehouse: {
        name: string;
    };
    lines: DeliveryOrderLine[];
}

interface Props {
    delivery: DeliveryOrder;
}

export default function Process({ delivery }: Props) {
    const { data, setData, post, processing } = useForm({
        lines: delivery.lines.map(line => ({
            id: line.id,
            quantity_done: line.quantity_done || 0,
        }))
    });

    const updateQuantity = (index: number, value: string) => {
        const newLines = [...data.lines];
        newLines[index].quantity_done = parseFloat(value) || 0;
        setData('lines', newLines);
    };

    const fillAll = () => {
        const newLines = data.lines.map((line, index) => ({
            ...line,
            quantity_done: delivery.lines[index].quantity_ordered,
        }));
        setData('lines', newLines);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/inventory/outbound/picking/${delivery.id}/process`);
    };

    const totalOrdered = delivery.lines.reduce((sum, line) => sum + line.quantity_ordered, 0);
    const totalPicked = data.lines.reduce((sum, line) => sum + line.quantity_done, 0);
    const progress = Math.round((totalPicked / totalOrdered) * 100);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Inventory', href: '/inventory' },
            { title: 'Picking', href: '/inventory/outbound/picking' },
            { title: delivery.delivery_number, href: '#' },
        ]}>
            <Head title={`Pick ${delivery.delivery_number}`} />

            <form onSubmit={handleSubmit} className="container mx-auto space-y-6">
                <PageHeader 
                    title={`Pick ${delivery.delivery_number}`}
                    description={`Customer: ${delivery.sales_order?.customer?.name || 'N/A'}`}
                    backUrl="/inventory/outbound/picking"
                >
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={fillAll}>
                            Auto-Fill All
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Picking
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progress}%</div>
                            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-medium">{delivery.sales_order?.document_number || 'Manual'}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Warehouse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-medium">{delivery.warehouse.name}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">{delivery.status}</Badge>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Items to Pick</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Package className="h-4 w-4" />
                                <span>{delivery.lines.length} items</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Product</TableHead>
                                    <TableHead className="text-center">Ordered</TableHead>
                                    <TableHead className="text-center">Previously Picked</TableHead>
                                    <TableHead className="text-center">Pick Quantity</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {delivery.lines.map((line, index) => (
                                    <TableRow key={line.id}>
                                        <TableCell>
                                            <div className="font-medium">{line.product.name}</div>
                                            <div className="text-xs text-muted-foreground">{line.product.code}</div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {line.quantity_ordered}
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">
                                            {line.quantity_done}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={line.quantity_ordered}
                                                    step="0.01"
                                                    value={data.lines[index].quantity_done}
                                                    onChange={(e) => updateQuantity(index, e.target.value)}
                                                    className="w-24 text-center"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {data.lines[index].quantity_done >= line.quantity_ordered ? (
                                                <Badge variant="default" className="gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Complete
                                                </Badge>
                                            ) : data.lines[index].quantity_done > 0 ? (
                                                <Badge variant="secondary">Partial</Badge>
                                            ) : (
                                                <Badge variant="outline">Pending</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                        <ScanBarcode className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Use barcode scanner or enter quantities manually
                        </span>
                    </div>
                    <div className="text-sm font-medium">
                        Total: {totalPicked.toFixed(2)} / {totalOrdered.toFixed(2)}
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
