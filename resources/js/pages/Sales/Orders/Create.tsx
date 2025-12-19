import { Head, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    customers: any[];
    warehouses: any[];
    products: any[];
}

export default function Create({ customers, warehouses, products }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        warehouse_id: '',
        date: new Date().toISOString().split('T')[0],
        items: [
            { product_id: '', quantity: 1, unit_price: 0 }
        ]
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Auto-fill price if product changes
        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product) {
                newItems[index].unit_price = product.sales_price || 0;
            }
        }
        
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/sales/orders');
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Sales', href: '/sales' },
            { title: 'Orders', href: '/sales/orders' },
            { title: 'Create', href: '#' },
        ]}>
            <Head title="Create Sales Order" />
            
            <form onSubmit={handleSubmit} className="container mx-auto space-y-6">
                <PageHeader 
                    title="Create Sales Order" 
                    description="Create a new sales order for a customer."
                    backUrl="/sales/orders"
                >
                    <Button type="submit" disabled={processing}>Save Order</Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Select value={data.customer_id} onValueChange={v => setData('customer_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.customer_id && <p className="text-red-500 text-sm">{errors.customer_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Warehouse</Label>
                                <Select value={data.warehouse_id} onValueChange={v => setData('warehouse_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.warehouse_id && <p className="text-red-500 text-sm">{errors.warehouse_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Order Date</Label>
                                <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Product</TableHead>
                                        <TableHead className="w-[20%]">Quantity</TableHead>
                                        <TableHead className="w-[20%]">Price</TableHead>
                                        <TableHead className="w-[10%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Select value={item.product_id} onValueChange={v => updateItem(index, 'product_id', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(p => (
                                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.code})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    min="1"
                                                    value={item.quantity} 
                                                    onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value))} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    min="0"
                                                    value={item.unit_price} 
                                                    onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value))} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {data.items.length > 1 && (
                                                    <Button size="icon" variant="ghost" type="button" onClick={() => removeItem(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button type="button" variant="outline" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                            {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
