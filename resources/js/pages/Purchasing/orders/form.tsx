import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect } from 'react';
import { store, update, index } from '@/routes/purchasing/orders';

interface PurchaseOrderItem {
    product_id: number;
    quantity: number;
    unit_price: number;
}

interface Props {
    vendors: any[];
    warehouses: any[];
    products: any[];
    order?: any;
}

export default function PurchaseOrderForm({ vendors, warehouses, products, order }: Props) {
    const isEditing = !!order;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        vendor_id: number | '';
        warehouse_id: number | '';
        date: string;
        notes: string;
        items: PurchaseOrderItem[];
    }>({
        vendor_id: order?.vendor_id || '',
        warehouse_id: order?.warehouse_id || '',
        date: order?.date || new Date().toISOString().split('T')[0],
        notes: order?.notes || '',
        items: order?.items?.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })) || [{ product_id: 0, quantity: 1, unit_price: 0 }],
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: 0, quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) {
            toast.error('At least one item is required');
            return;
        }
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Auto-fill price when product is selected
        if (field === 'product_id') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                newItems[index].unit_price = Number(product.cost || 0);
            }
        }
        
        setData('items', newItems);
    };

    const calculateSubtotal = (item: PurchaseOrderItem) => {
        return item.quantity * item.unit_price;
    };

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        // Validate items
        if (data.items.some(item => !item.product_id || item.product_id === 0)) {
            toast.error('Please select a product for all items');
            return;
        }
        
        const options = {
            onSuccess: () => toast.success(`Purchase Order ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: () => toast.error('Please check the form for errors.'),
        };

        if (isEditing) {
            put(update.url(order.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Purchasing', href: '/purchasing' }, 
            { title: 'Purchase Orders', href: '/purchasing/orders' },
            { title: isEditing ? order.document_number : 'New PO', href: '#' }
        ]}>
            <Head title={isEditing ? `Edit ${order.document_number}` : "New Purchase Order"} />
            
            <div className="max-w-6xl">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Purchase Orders
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Header Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{isEditing ? `Edit ${order.document_number}` : 'Create New Purchase Order'}</CardTitle>
                            <CardDescription>
                                {isEditing ? 'Update purchase order details' : 'Fill in the details for your purchase order.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor_id">Vendor <span className="text-destructive">*</span></Label>
                                    <Select 
                                        value={data.vendor_id.toString()} 
                                        onValueChange={(value) => setData('vendor_id', Number(value))}
                                    >
                                        <SelectTrigger id="vendor_id">
                                            <SelectValue placeholder="Select vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map((vendor) => (
                                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.vendor_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="warehouse_id">Warehouse <span className="text-destructive">*</span></Label>
                                    <Select 
                                        value={data.warehouse_id.toString()} 
                                        onValueChange={(value) => setData('warehouse_id', Number(value))}
                                    >
                                        <SelectTrigger id="warehouse_id">
                                            <SelectValue placeholder="Select warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.warehouse_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Order Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    <InputError message={errors.date} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes or instructions..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Order Items</CardTitle>
                                    <CardDescription>Add products to this purchase order</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                                        <div className="col-span-5 space-y-2">
                                            <Label>Product <span className="text-destructive">*</span></Label>
                                            <Select 
                                                value={item.product_id.toString()} 
                                                onValueChange={(value) => updateItem(index, 'product_id', Number(value))}
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
                                            {errors[`items.${index}.product_id` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.product_id` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label>Quantity <span className="text-destructive">*</span></Label>
                                            <Input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors[`items.${index}.quantity` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.quantity` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label>Unit Price <span className="text-destructive">*</span></Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors[`items.${index}.unit_price` as keyof typeof errors] && (
                                                <InputError message={errors[`items.${index}.unit_price` as keyof typeof errors]} />
                                            )}
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label>Subtotal</Label>
                                            <Input
                                                type="text"
                                                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateSubtotal(item))}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>

                                        <div className="col-span-1 flex items-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Total */}
                                <div className="flex justify-end pt-4 border-t">
                                    <div className="w-64 space-y-2">
                                        <div className="flex justify-between items-center text-lg font-semibold">
                                            <span>Total:</span>
                                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal())}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : (isEditing ? 'Update Purchase Order' : 'Create Purchase Order')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
