import { Head, Link, useForm } from '@inertiajs/react';
import * as Quotations from '@/actions/App/Http/Controllers/Sales/Operations/QuotationController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

interface Props {
    customers: any[];
    warehouses: any[];
    products: any[];
}
export default function QuotationCreate({ customers, warehouses, products }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        warehouse_id: '',
        date: new Date().toISOString().split('T')[0],
        lines: [{ product_id: '', description: '', quantity: 1, unit_price: 0, subtotal: 0 }]
    });

    const addLine = () => {
        setData('lines', [...data.lines, { product_id: '', description: '', quantity: 1, unit_price: 0, subtotal: 0 }]);
    };

    const removeLine = (index: number) => {
        const newLines = data.lines.filter((_, i) => i !== index);
        setData('lines', newLines);
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...data.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        
        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product) {
                newLines[index].description = product.name;
                newLines[index].unit_price = parseFloat(product.price || 0);
            }
        }
        
        if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
             newLines[index].subtotal = newLines[index].quantity * newLines[index].unit_price;
        }

        setData('lines', newLines);
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(Quotations.store.url());
    };

    const total = data.lines.reduce((sum, line) => sum + line.subtotal, 0);

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Quotations', href: Quotations.index.url() }, { title: 'Create', href: '#' }]}>
            <Head title="New Quotation" />
            
            <div className="w-full">
                <form onSubmit={handleSubmit}>
                    <PageHeader 
                        title="New Quotation" 
                        description="Create a new sales quotation for a customer."
                        backUrl={Quotations.index.url()}
                    >
                         <Button type="submit" disabled={processing}>Save Quotation</Button>
                    </PageHeader>
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Select value={data.customer_id} onValueChange={val => setData('customer_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.company_name || c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.customer_id && <div className="text-red-500 text-xs">{errors.customer_id}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Warehouse</Label>
                                <Select value={data.warehouse_id} onValueChange={val => setData('warehouse_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <Button type="button" size="sm" variant="secondary" onClick={addLine}>
                                <Plus className="w-4 h-4 mr-2" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="w-24">Qty</TableHead>
                                        <TableHead className="w-32">Price</TableHead>
                                        <TableHead className="text-right w-32">Subtotal</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.lines.map((line, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Select value={line.product_id} onValueChange={val => updateLine(index, 'product_id', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(p => (
                                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" min="1" value={line.quantity} onChange={e => updateLine(index, 'quantity', parseFloat(e.target.value))} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" min="0" value={line.unit_price} onChange={e => updateLine(index, 'unit_price', parseFloat(e.target.value))} />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {line.subtotal.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(index)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-end mt-4">
                                <div className="text-right">
                                    <span className="text-muted-foreground mr-4">Total:</span>
                                    <span className="text-xl font-bold">{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
