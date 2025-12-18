import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

export default function CreateInvoice({ customers, products }: { customers: any[], products: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        lines: [
            { product_id: '', description: '', quantity: 1, unit_price: 0, subtotal: 0 }
        ]
    });

    const addLine = () => {
        setData('lines', [...data.lines, { product_id: '', description: '', quantity: 1, unit_price: 0, subtotal: 0 }]);
    };

    const removeLine = (index: number) => {
        const newLines = [...data.lines];
        newLines.splice(index, 1);
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
        
        // Recalculate subtotal
        newLines[index].subtotal = newLines[index].quantity * newLines[index].unit_price;
        
        setData('lines', newLines);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/accounting/ar/invoices');
    };

    const total = data.lines.reduce((sum, line) => sum + line.subtotal, 0);

  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'New Invoice', href: '#' }]}>
      <Head title="New Invoice" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Create Customer Invoice</h2>
         
         <form onSubmit={handleSubmit}>
             <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <Select onValueChange={(val) => setData('customer_id', val)} value={data.customer_id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.customer_id && <div className="text-red-500 text-sm">{errors.customer_id}</div>}
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                            {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} />
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Product</TableHead>
                                    <TableHead className="w-[30%]">Description</TableHead>
                                    <TableHead className="w-[10%]">Qty</TableHead>
                                    <TableHead className="w-[15%]">Price</TableHead>
                                    <TableHead className="w-[10%] text-right">Subtotal</TableHead>
                                    <TableHead className="w-[5%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.lines.map((line, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Select 
                                                value={line.product_id ? line.product_id.toString() : undefined} 
                                                onValueChange={(val) => updateLine(index, 'product_id', val)}
                                            >
                                                <SelectTrigger className="h-8">
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
                                            <Input 
                                                className="h-8" 
                                                value={line.description} 
                                                onChange={(e) => updateLine(index, 'description', e.target.value)} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                className="h-8" 
                                                value={line.quantity} 
                                                onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value))} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                className="h-8" 
                                                value={line.unit_price} 
                                                onChange={(e) => updateLine(index, 'unit_price', parseFloat(e.target.value))} 
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {line.subtotal.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(index)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center">
                        <Button type="button" variant="outline" size="sm" onClick={addLine}>
                            <Plus className="mr-2 h-4 w-4" /> Add Line
                        </Button>
                        <div className="text-right font-bold text-lg">
                            Total: {total.toLocaleString()}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" asChild>
                            <Link href="/accounting/ar/invoices">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Invoice
                        </Button>
                    </div>
                </CardContent>
             </Card>
         </form>
      </div>
    </AppLayout>
  );
}
