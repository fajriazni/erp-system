import React from 'react';
import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { index, show, update } from '@/routes/accounting/bills';
import InputError from '@/components/input-error';

interface Product {
    id: number;
    name: string;
    code: string;
}

interface VendorBillItem {
    id?: number;
    product_id: number | null;
    product?: Product;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface VendorBill {
    id: number;
    purchase_order_id: number | null;
    vendor_id: number;
    bill_number: string;
    reference_number: string;
    date: string;
    due_date: string | null;
    status: string;
    notes: string | null;
    attachment_path: string | null;
    items: VendorBillItem[];
}

interface Props {
    bill: VendorBill;
    vendors: { id: number; company_name: string; name: string }[];
    products: Product[];
    paymentSchedule?: any[];
}

export default function Edit({ bill, vendors, products, paymentSchedule = [] }: Props) {
    const { data, setData, post, processing, errors } = useInertiaForm<{
        _method: string;
        vendor_id: number | string;
        reference_number: string;
        date: string;
        due_date: string;
        notes: string;
        items: {
            id?: number;
            product_id: number | string; 
            description: string;
            quantity: number;
            unit_price: number;
        }[];
        attachment: File | null;
    }>({
        _method: 'PUT',
        vendor_id: bill.vendor_id,
        reference_number: bill.reference_number,
        date: bill.date,
        due_date: bill.due_date || '',
        notes: bill.notes || '',
        items: bill.items.map(item => ({
            id: item.id,
            product_id: item.product_id || '',
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
        })),
        attachment: null,
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const applySchedule = (item: any) => {
        // Use loaded PO items if available (requires controller update to eager load 'purchaseOrder.items')
        const poItems = (bill.purchase_order_id && (bill as any).purchase_order?.items) 
            ? (bill as any).purchase_order.items 
            : null;
        
        const poTotal = (bill as any).purchase_order?.total ?? 0;
        const targetAmount = item.status === 'partial' ? (item.remaining_amount ?? 0) : item.amount;
            
        let ratio = 1;
        if (poTotal > 0) {
            ratio = targetAmount / poTotal;
        }

        let newItems = [];
        if (poItems) {
             newItems = poItems.map((poItem: any) => ({
                id: undefined, // New item ID
                product_id: poItem.product_id,
                description: poItem.description || poItem.product?.name,
                quantity: poItem.quantity,
                unit_price: poItem.unit_price * ratio
            }));
        } else {
             // Fallback if PO items not loaded
             newItems = [{
                id: undefined,
                product_id: '',
                description: item.description,
                quantity: 1,
                unit_price: targetAmount
            }];
        }

        setData(current => ({
            ...current,
            due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
            notes: `Payment for: ${item.description} (${item.percent}%)`,
            items: newItems,
            // Restore tax settings from PO if possible, otherwise keep current bill's
            // Assuming bill.purchase_order has tax info
             tax_rate: (bill as any).purchase_order?.tax_rate ?? 11,
             withholding_tax_rate: (bill as any).purchase_order?.withholding_tax_rate ?? 0,
        }));
        toast.success(`Applied schedule: ${item.description}. Items prorated (${(ratio * 100).toFixed(1)}%).`);
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
        // Use post with _method: PUT for file upload support in Inertia
        post(update.url(bill.id), {
            onSuccess: () => {
                toast.success('Vendor bill updated successfully');
            },
            onError: () => {
                toast.error('Failed to update vendor bill. Please check the form for errors.');
            }
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Vendor Bills', href: index.url() },
                { title: bill.bill_number, href: show.url(bill.id) },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit Bill ${bill.bill_number}`} />

            <div> 
                <div>
                     <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={show.url(bill.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bill
                        </Link>
                    </Button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">Edit Vendor Bill</h1>
                        <div className="text-sm text-muted-foreground">
                            {bill.bill_number}
                        </div>
                    </div>
                </div>

                {bill.purchase_order_id && paymentSchedule && paymentSchedule.length > 0 && (
                    <Card className="mb-6 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Payment Schedule</CardTitle>
                            <CardDescription>
                                Bill logic tracks payment progress. Click "Apply" to switch term.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {paymentSchedule.map((item, idx) => {
                                    const isBilled = item.status === 'billed';
                                    const isPartial = item.status === 'partial';
                                    
                                    return (
                                    <div 
                                        key={idx} 
                                        className={`p-4 border rounded-lg bg-background shadow-sm transition-colors group relative ${isBilled ? 'opacity-60 bg-muted/50' : 'hover:border-primary cursor-pointer'}`}
                                        onClick={() => !isBilled && applySchedule(item)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-primary">{item.description}</span>
                                            <div className="flex gap-2">
                                                {isBilled && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">BILLED</span>}
                                                {isPartial && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold">PARTIAL</span>}
                                                <span className="text-xs bg-muted px-2 py-1 rounded">{item.percent}%</span>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold mb-1">
                                            {formatCurrency(item.remaining_amount ?? item.amount)}
                                            {isPartial && <span className="text-xs text-muted-foreground ml-2 font-normal line-through">{formatCurrency(item.amount)}</span>}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex justify-between items-center mt-3">
                                            <span>Results from: {item.trigger}</span>
                                            {item.due_date && <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>}
                                        </div>
                                        
                                        {!isBilled && (
                                            <Button size="sm" variant="secondary" className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); applySchedule(item); }}>
                                                Apply {isPartial ? 'Remaining' : 'This'}
                                            </Button>
                                        )}
                                    </div>
                                )})}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bill Details</CardTitle>
                            <CardDescription>Update invoice details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor_id">Vendor <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={data.vendor_id ? String(data.vendor_id) : ''}
                                        onValueChange={(value) => setData('vendor_id', parseInt(value))}
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

                             <div className="space-y-2">
                                <Label htmlFor="attachment">Invoice Attachment</Label>
                                {bill.attachment_path && (
                                    <div className="mb-2 text-sm flex items-center text-blue-600">
                                        <FileText className="h-4 w-4 mr-1" />
                                        <span>Current attachment exists</span>
                                    </div>
                                )}
                                <Input
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                                    className="cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Upload new file to replace current attachment (PDF, JPG, PNG, DOC, Max 10MB)</span>
                                </div>
                                <InputError message={errors.attachment} />
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
                                            {// @ts-ignore
                                            errors[`items.${index}.description`] && (
                                                // @ts-ignore
                                                <InputError message={errors[`items.${index}.description`]} />
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
                                              {/* @ts-ignore */}
                                              {errors[`items.${index}.quantity`] && (
                                                // @ts-ignore
                                                <InputError message={errors[`items.${index}.quantity`]} />
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
                                             {/* @ts-ignore */}
                                             {errors[`items.${index}.unit_price`] && (
                                                // @ts-ignore
                                                <InputError message={errors[`items.${index}.unit_price`]} />
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
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {processing ? 'Saving...' : 'Update Bill'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
