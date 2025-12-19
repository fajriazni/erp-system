
import React, { useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Save } from 'lucide-react';

interface FormProps {
    products: { id: number; name: string; code: string; uom_id?: number | null }[];
    uoms: { id: number; name: string; symbol: string }[];
    initialData?: {
        title: string;
        deadline: string;
        notes: string | null;
        items: { product_id: string; quantity: number | string; uom_id: string; target_price: number | string; notes: string | null }[];
    };
    submitUrl: string;
    method?: 'post' | 'put';
    cancelUrl: string;
    isEdit?: boolean;
}

export default function Form({ products, uoms, initialData, submitUrl, method = 'post', cancelUrl, isEdit = false }: FormProps) {
    const { data, setData, submit, processing, errors, transform } = useForm({
        title: initialData?.title || '',
        deadline: initialData?.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: initialData?.notes || '',
        items: initialData?.items || [] as { product_id: string; quantity: number | string; uom_id: string; target_price: number | string; notes: string }[],
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
        
        // Transform data types if needed before submission
        transform((data) => ({
            ...data,
            // Ensure numbers are actually numbers for backend validation if strictly required, 
            // though Inertia usually handles string/number conversion fine with Laravel request validation.
        }));

        if (method === 'put') {
            submit('put', submitUrl);
        } else {
            submit('post', submitUrl);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEdit ? 'Edit Request for Quotation' : 'Create Request for Quotation'}</CardTitle>
                <CardDescription>{isEdit ? 'Update existing tender details.' : 'Create a new tender to invite vendor bids.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="rfq-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title / Reference <span className="text-destructive">*</span></Label>
                            <Input 
                                id="title"
                                placeholder="e.g. Q1 Office Supplies Restock"
                                value={data.title} 
                                onChange={e => setData('title', e.target.value)}
                            />
                            {errors.title && <div className="text-destructive text-sm">{errors.title}</div>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline <span className="text-destructive">*</span></Label>
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
                                    <Label className="text-xs">Product <span className="text-destructive">*</span></Label>
                                    <Select 
                                        value={item.product_id?.toString()}
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
                                    <Label className="text-xs">Quantity <span className="text-destructive">*</span></Label>
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
                                        value={item.uom_id?.toString()}
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
                                        value={item.notes || ''}
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
                </form>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 pt-5">
                <Button variant="outline" asChild>
                    <Link href={cancelUrl}>Cancel</Link>
                </Button>
                <Button type="submit" form="rfq-form" disabled={processing}>
                    <Save className="mr-2 h-4 w-4" /> {isEdit ? 'Update RFQ' : 'Create RFQ'}
                </Button>
            </CardFooter>
        </Card>
    );
}
