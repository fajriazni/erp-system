import React from 'react';
import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { index, store } from '@/routes/purchasing/bills';
import InputError from '@/components/input-error';

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
    items: PurchaseOrderItem[];
}

interface Props {
    purchaseOrder?: PurchaseOrder;
    vendors: { id: number; company_name: string; name: string }[];
    products: Product[];
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
            product_id: number | string; // Changed to match Select value type
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
        items: purchaseOrder?.items?.map((item: any) => ({
            product_id: item.product_id,
            description: item.description || item.product.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })) || [{ product_id: '', description: '', quantity: 1, unit_price: 0 }],
    });

    const calculateSubtotal = (item: typeof data.items[0]) => {
        return item.quantity * item.unit_price;
    };

    const calculateTotal = () => {
        return data.items.reduce((total, item) => total + calculateSubtotal(item), 0);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        
        // Auto-fill description if product selected
        if (field === 'product_id') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                 // @ts-ignore
                newItems[index]['description'] = product.name;
            }
        }
        
        setData('items', newItems);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            { product_id: '', description: '', quantity: 1, unit_price: 0 }
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) return;
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

            <div className="max-w-6xl"> 
                <div className="mb-6">
                     <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bill Details</CardTitle>
                            <CardDescription>Enter the invoice details received from the vendor.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor_id">Vendor <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={data.vendor_id ? String(data.vendor_id) : ''}
                                        onValueChange={(value) => setData('vendor_id', parseInt(value))}
                                        disabled={!!purchaseOrder}
                                    >
                                        <SelectTrigger id="vendor_id">
                                            <SelectValue placeholder="Select Vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map((vendor) => (
                                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                    {vendor.company_name || vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.vendor_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        placeholder="e.g. INV-2023-001"
                                    />
                                    <InputError message={errors.reference_number} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Bill Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    <InputError message={errors.date} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                    />
                                    <InputError message={errors.due_date} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Items</CardTitle>
                                <CardDescription>List of items billed.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                                        <div className="col-span-4 space-y-2">
                                            <Label>Product</Label>
                                            <Select
                                                value={item.product_id ? item.product_id.toString() : ''}
                                                onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={product.id.toString()}>
                                                            {product.name} ({product.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="col-span-3 space-y-2">
                                            <Label>Description <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                placeholder="Description"
                                            />
                                            {errors[`items.${index}.description` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.description` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label>Qty <span className="text-destructive">*</span></Label>
                                            <Input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                            />
                                              {errors[`items.${index}.quantity` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.quantity` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label>Price <span className="text-destructive">*</span></Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                                            />
                                             {errors[`items.${index}.unit_price` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.unit_price` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-1 flex items-end justify-end mt-8">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(index)}
                                                disabled={data.items.length === 1}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-4 border-t">
                                    <div className="text-xl font-bold">
                                        Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
                                    </div>
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
                            {processing ? 'Saving...' : 'Create Bill'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
