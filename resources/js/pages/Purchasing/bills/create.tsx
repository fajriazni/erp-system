import React from 'react';
import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
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
    paymentSchedule?: {
        description: string;
        percent: number;
        amount: number;
        due_date: string | null;
        trigger: string;
        days_due: number;
        status?: 'pending' | 'partial' | 'billed';
        remaining_amount?: number;
    }[];
}

export default function Create({ purchaseOrder, vendors, products, paymentSchedule = [] }: Props) {
    const { data, setData, post, processing, errors } = useInertiaForm<{
        purchase_order_id: number | string;
        vendor_id: number | string;
        reference_number: string;
        date: string;
        due_date: string;
        notes: string;
        items: {
            product_id: number | string;
            description: string;
            quantity: number;
            unit_price: number;
        }[];
        attachment: File | null;
        tax_rate: number;
        withholding_tax_rate: number;
        tax_inclusive: boolean;
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
        attachment: null,
        tax_rate: (purchaseOrder as any)?.tax_rate ?? 11,
        withholding_tax_rate: (purchaseOrder as any)?.withholding_tax_rate ?? 0,
        tax_inclusive: (purchaseOrder as any)?.tax_inclusive ?? false,
    });

    const calculateSubtotal = (item: typeof data.items[0]) => {
        return item.quantity * item.unit_price;
    };

    const calculateTotal = () => {
        return data.items.reduce((total, item) => total + calculateSubtotal(item), 0);
    };

    const calculateTax = () => {
        const subtotal = calculateTotal();
        let baseAmount = subtotal;
        
        if (data.tax_inclusive && data.tax_rate > 0) {
            baseAmount = subtotal / (1 + (data.tax_rate / 100));
        }
        
        const taxAmount = baseAmount * (data.tax_rate / 100);
        const withholdingAmount = baseAmount * (data.withholding_tax_rate / 100);
        const total = data.tax_inclusive ? subtotal : (baseAmount + taxAmount);
        const netPayable = total - withholdingAmount;
        
        return {
            subtotal: baseAmount,
            taxAmount,
            withholdingAmount,
            total,
            netPayable
        };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const taxCalc = calculateTax();

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

    const applySchedule = (item: any) => {
        // Calculate ratio based on schedule amount vs total PO amount
        // If PO has tax, we assume item.amount is Gross? Or Net? 
        // Usually Schedule is defined on Total (Gross). 
        // PO Total = Gross.
        // Ratio = TargetAmount / PO Total.
        
        const poTotal = (purchaseOrder as any).total ?? 0;
        const targetAmount = item.status === 'partial' ? (item.remaining_amount ?? 0) : item.amount;
        
        let ratio = 1;
        if (poTotal > 0) {
            ratio = targetAmount / poTotal;
        }

        const newItems = (purchaseOrder as any).items?.map((poItem: any) => ({
            product_id: poItem.product_id,
            description: poItem.description || poItem.product?.name,
            quantity: poItem.quantity, // Keep quantity, adjust price
            unit_price: poItem.unit_price * ratio
        })) || [];

        setData(current => ({
            ...current,
            due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
            notes: `Payment for: ${item.description} (${item.percent}%)`,
            items: newItems.length > 0 ? newItems : [{
                product_id: '',
                description: item.description,
                quantity: 1,
                unit_price: targetAmount
            }],
            // Restore tax settings from PO
            tax_rate: (purchaseOrder as any)?.tax_rate ?? 11,
            withholding_tax_rate: (purchaseOrder as any)?.withholding_tax_rate ?? 0,
        }));
        toast.success(`Applied schedule: ${item.description}. Items prorated (${(ratio * 100).toFixed(1)}%).`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            preserveScroll: true,
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Failed to create bill. Please check the form for errors.');
                // Debug: verify if errors are being received
                if (Object.keys(errors).length > 0) {
                     // Check if there are general errors not attached to fields
                     if (errors.items) {
                         toast.error(errors.items);
                     }
                }
            }
        });
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

            <div> 
                <div>
                     <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Link>
                    </Button>
                </div>

                {purchaseOrder && paymentSchedule && paymentSchedule.length > 0 && (
                    <Card className="mb-6 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Payment Schedule Detected</CardTitle>
                            <CardDescription>
                                This PO has a defined payment schedule. Click "Apply" to pre-fill existing terms.
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
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.remaining_amount ?? item.amount)}
                                            {isPartial && <span className="text-xs text-muted-foreground ml-2 font-normal line-through">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}</span>}
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

                             <div className="space-y-2">
                                <Label htmlFor="attachment">Invoice Attachment</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground">Upload PDF, JPG, PNG, DOC (Max 10MB)</p>
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

                                {/* Tax Breakdown */}
                                <div className="flex justify-end pt-4 border-t">
                                    <div className="w-80 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal:</span>
                                            <span className="font-mono">{formatCurrency(taxCalc.subtotal)}</span>
                                        </div>
                                        {data.tax_rate > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">PPN {data.tax_rate}%:</span>
                                                <span className="font-mono text-green-600">+{formatCurrency(taxCalc.taxAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span className="font-mono">{formatCurrency(taxCalc.total)}</span>
                                        </div>
                                        {data.withholding_tax_rate > 0 && (
                                            <>
                                                <div className="flex justify-between text-sm text-red-600">
                                                    <span>PPh 23 {data.withholding_tax_rate}%:</span>
                                                    <span className="font-mono">-{formatCurrency(taxCalc.withholdingAmount)}</span>
                                                </div>
                                                <div className="flex justify-between font-semibold text-primary border-t pt-2">
                                                    <span>Net Payable:</span>
                                                    <span className="font-mono">{formatCurrency(taxCalc.netPayable)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tax Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tax Configuration</CardTitle>
                            <CardDescription>Configure tax rates for this bill</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tax_rate">PPN Rate (%)</Label>
                                    <Input
                                        id="tax_rate"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.tax_rate}
                                        onChange={(e) => setData('tax_rate', parseFloat(e.target.value) || 0)}
                                    />
                                    <p className="text-xs text-muted-foreground">Value Added Tax (typically 11%)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="withholding_tax_rate">PPh 23 Rate (%)</Label>
                                    <Input
                                        id="withholding_tax_rate"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.withholding_tax_rate}
                                        onChange={(e) => setData('withholding_tax_rate', parseFloat(e.target.value) || 0)}
                                    />
                                    <p className="text-xs text-muted-foreground">Withholding tax (typically 2%)</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="tax_inclusive"
                                    checked={data.tax_inclusive}
                                    onCheckedChange={(checked) => setData('tax_inclusive', checked as boolean)}
                                />
                                <Label htmlFor="tax_inclusive" className="font-normal cursor-pointer">
                                    Tax Inclusive (prices already include tax)
                                </Label>
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
