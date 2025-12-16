import React, { useEffect } from 'react';
import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Trash, ArrowLeft } from 'lucide-react';
import { index, store } from '@/routes/purchasing/bills';

interface Product {
    id: number;
    name: string;
    code: string;
}

interface PurchaseOrderItem {
    id: number;
    product_id: number;
    product: Product;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface PurchaseOrder {
    id: number;
    document_number: string;
    vendor_id: number;
    vendor: {
        id: number;
        name: string;
    };
    items: PurchaseOrderItem[];
}

interface Props {
    purchaseOrder?: any;
    vendors: any[];
    products: any[];
}

export default function Create({ purchaseOrder, vendors, products }: Props) {
    const { data, setData, post, processing, errors } = useInertiaForm<{
        purchase_order_id: number | string;
        vendor_id: number | string;
        reference_number: string;
        date: string;
        due_date: string;
        notes: string;
        items: {
            product_id: number | null;
            description: string;
            quantity: number;
            unit_price: number;
        }[];
    }>({
        purchase_order_id: purchaseOrder?.id || '',
        vendor_id: purchaseOrder?.vendor_id || '',
        reference_number: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        items: purchaseOrder?.items.map((item: any) => ({
            product_id: item.product_id,
            description: item.description || item.product.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })) || [],
    });

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            return total + (item.quantity * item.unit_price);
        }, 0);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            { product_id: null, description: '', quantity: 1, unit_price: 0 }
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Purchasing', href: '/purchasing' },
                { title: 'Vendor Bills', href: index.url() },
                { title: 'Create', href: '#' },
            ]}
        >
            <Head title="Create Vendor Bill" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h2 className="text-2xl font-semibold tracking-tight">Create Vendor Bill</h2>
                            <p className="text-sm text-muted-foreground">Record a new vendor invoice.</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bill Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="vendor_id">Vendor</Label>
                                        <select
                                            id="vendor_id"
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.vendor_id}
                                            onChange={(e) => setData('vendor_id', e.target.value)}
                                            disabled={!!purchaseOrder}
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map((vendor) => (
                                                <option key={vendor.id} value={vendor.id}>
                                                    {vendor.company_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.vendor_id && (
                                            <p className="text-sm text-destructive">{errors.vendor_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reference_number">Reference Number (Invoice #)</Label>
                                        <Input
                                            id="reference_number"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            placeholder="e.g. INV-2023-001"
                                        />
                                        {errors.reference_number && (
                                            <p className="text-sm text-destructive">{errors.reference_number}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date">Bill Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-destructive">{errors.date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="due_date">Due Date</Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                        />
                                        {errors.due_date && (
                                            <p className="text-sm text-destructive">{errors.due_date}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Additional notes..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Items</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[30%]">Product</TableHead>
                                                <TableHead className="w-[30%]">Description</TableHead>
                                                <TableHead className="w-[10%]">Qty</TableHead>
                                                <TableHead className="w-[20%]">Unit Price</TableHead>
                                                <TableHead className="w-[10%]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <select
                                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={item.product_id || ''}
                                                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                                        >
                                                            <option value="">Select Product</option>
                                                            {products.map((product) => (
                                                                <option key={product.id} value={product.id}>
                                                                    {product.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            placeholder="Description"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={item.unit_price}
                                                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                            disabled={data.items.length === 1}
                                                        >
                                                            <Trash className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table> 
                                    <div className="mt-4 flex justify-end">
                                        <div className="text-lg font-bold">
                                            Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Bill
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
