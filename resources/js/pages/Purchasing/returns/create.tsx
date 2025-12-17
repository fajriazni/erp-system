import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { index, store } from '@/routes/purchasing/returns';

interface Props {
    vendors: { id: number; name: string }[];
    products: { id: number; name: string; code: string; price: number; cost: number }[];
    warehouses: { id: number; name: string }[];
}

export default function Create({ vendors, products, warehouses }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        vendor_id: '',
        warehouse_id: warehouses.length > 0 ? warehouses[0].id.toString() : '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [] as { product_id: string; quantity: number; unit_price: number }[],
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
        const item = { ...newItems[index], [field]: value };
        
        // Auto-fill price if product changes
        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product) {
                // Default to cost or price? Ideally cost for return.
                item.unit_price = product.cost || 0;
            }
        }

        newItems[index] = item;
        setData('items', newItems);
    };

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'Purchase Returns', href: index.url() },
            { title: 'Create Return' }
        ]}>
            <Head title="Create Purchase Return" />
            <div className="container mx-auto">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={index.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Purchase Return</CardTitle>
                        <CardDescription>Record items returned to vendor.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Vendor</Label>
                                    <Select 
                                        value={data.vendor_id} 
                                        onValueChange={(val) => setData('vendor_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map(vendor => (
                                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.vendor_id && <div className="text-red-500 text-sm">{errors.vendor_id}</div>}
                                </div>
                                <div>
                                    <Label>Warehouse (Source)</Label>
                                    <Select 
                                        value={data.warehouse_id} 
                                        onValueChange={(val) => setData('warehouse_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(wh => (
                                                <SelectItem key={wh.id} value={wh.id.toString()}>
                                                    {wh.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.warehouse_id && <div className="text-red-500 text-sm">{errors.warehouse_id}</div>}
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input 
                                        type="date"
                                        value={data.date} 
                                        onChange={e => setData('date', e.target.value)}
                                    />
                                    {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
                                </div>
                            </div>

                            <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                                <h3 className="text-lg font-medium mb-4">Items</h3>
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 mb-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs">Product</Label>
                                            <Select 
                                                value={item.product_id}
                                                onValueChange={(val) => updateItem(idx, 'product_id', val)} 
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map(p => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            {p.code} - {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-24">
                                            <Label className="text-xs">Qty</Label>
                                            <Input 
                                                type="number" 
                                                min="0"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value)||0)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label className="text-xs">Unit Cost</Label>
                                            <Input 
                                                type="number" 
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value)||0)}
                                            />
                                        </div>
                                        <div className="w-32 pt-2 text-right font-medium">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.quantity * item.unit_price)}
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                                {errors.items && <div className="text-red-500 text-sm mt-2">{errors.items}</div>}
                            </div>

                            <div className="flex justify-end items-center gap-4">
                                <div className="text-lg font-bold">
                                    Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
                                </div>
                            </div>

                            <div>
                                <Label>Notes</Label>
                                <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => history.back()}>Cancel</Button>
                                <Button type="submit" disabled={processing}>Create Purchase Return</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
