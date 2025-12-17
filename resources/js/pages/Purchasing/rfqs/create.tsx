import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Trash2, Plus, Save } from 'lucide-react';
import { index, store } from '@/routes/purchasing/rfqs';

interface Props {
    products: { id: number; name: string; code: string; uom_id?: number | null }[];
    uoms: { id: number; name: string; symbol: string }[];
}

export default function Create({ products, uoms }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
        notes: '',
        items: [] as { product_id: string; quantity: number | string; uom_id: string; target_price: number | string; notes: string }[],
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', quantity: 1, uom_id: '', target_price: '', notes: '' }]);
    };

    const removeItem = (itemIndex: number) => {
        const newItems = [...data.items];
        newItems.splice(itemIndex, 1);
        setData('items', newItems);
    };

    const updateItem = (itemIndex: number, field: string, value: any) => {
        const newItems = [...data.items];
        const item = { ...newItems[itemIndex], [field]: value };
        
        // Auto-fill UOM if product changes
        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product && product.uom_id) {
                item.uom_id = product.uom_id.toString();
            }
        }

        newItems[itemIndex] = item;
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' },
            { title: 'RFQs', href: index.url() },
            { title: 'Create RFQ' }
        ]}>
            <Head title="Create RFQ" />
            <div className="container mx-auto max-w-4xl">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={index.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Request for Quotation</CardTitle>
                        <CardDescription>Create a new tender to invite vendor bids.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title / Reference</Label>
                                    <Input 
                                        id="title"
                                        placeholder="e.g. Q1 Office Supplies Restock"
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)}
                                    />
                                    {errors.title && <div className="text-destructive text-sm">{errors.title}</div>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Deadline</Label>
                                    <Input 
                                        id="deadline"
                                        type="date"
                                        value={data.deadline} 
                                        onChange={e => setData('deadline', e.target.value)}
                                    />
                                    {errors.deadline && <div className="text-destructive text-sm">{errors.deadline}</div>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea 
                                        id="notes"
                                        placeholder="Internal notes or description..."
                                        value={data.notes} 
                                        onChange={e => setData('notes', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/50">
                                <h3 className="text-lg font-medium mb-4">Requested Items</h3>
                                {data.items.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No items added yet. Click "Add Item" to start.
                                    </div>
                                )}
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 mb-4 items-end border-b pb-4 last:border-0 last:pb-0">
                                        <div className="col-span-12 md:col-span-4">
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
                                        <div className="col-span-6 md:col-span-2">
                                            <Label className="text-xs">Quantity</Label>
                                            <Input 
                                                type="number" 
                                                min="0"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <Label className="text-xs">UOM</Label>
                                            <Select 
                                                value={item.uom_id}
                                                onValueChange={(val) => updateItem(idx, 'uom_id', val)} 
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="UOM" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {uoms.map(u => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>
                                                            {u.symbol}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="col-span-6 md:col-span-2">
                                            <Label className="text-xs">Target Price (Opt)</Label>
                                            <Input 
                                                type="number"
                                                value={item.target_price}
                                                onChange={e => updateItem(idx, 'target_price', e.target.value)}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                        <div className="col-span-12">
                                            <Input 
                                                placeholder="Additional notes for this item..."
                                                value={item.notes}
                                                onChange={e => updateItem(idx, 'notes', e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                                {errors.items && <div className="text-destructive text-sm mt-2">{errors.items}</div>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => history.back()}>Cancel</Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" /> Create RFQ
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
