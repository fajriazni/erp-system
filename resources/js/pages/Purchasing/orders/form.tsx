
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { FormEvent, useEffect } from 'react';
import { store, update, index } from '@/routes/purchasing/orders';
import axios from 'axios';
import { PageHeader } from '@/components/ui/page-header'; // Added import

interface PurchaseOrderItem {
    product_id: number;
    quantity: number;
    unit_price: number;
}

interface Props {
    vendors: any[];
    warehouses: any[];
    products: any[];
    paymentTerms?: any[];
    order?: any;
}

export default function PurchaseOrderForm({ vendors, warehouses, products, paymentTerms = [], order }: Props) {
    const isEditing = !!order;
    
    const { data, setData, post, put, processing, errors } = useForm<{
        vendor_id: number | '';
        warehouse_id: number | '';
        date: string;
        payment_term_id: string;
        notes: string;
        items: PurchaseOrderItem[];
        tax_rate: number;
        withholding_tax_rate: number;
        tax_inclusive: boolean;
    }>({
        vendor_id: order?.vendor_id || '',
        warehouse_id: order?.warehouse_id || '',
        date: order?.date || new Date().toISOString().split('T')[0],
        payment_term_id: order?.payment_term_id ? String(order.payment_term_id) : '',
        notes: order?.notes || '',
        items: order?.items?.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })) || [{ product_id: 0, quantity: 1, unit_price: 0 }],
        tax_rate: order?.tax_rate ?? 11,
        withholding_tax_rate: order?.withholding_tax_rate ?? 0,
        tax_inclusive: order?.tax_inclusive ?? false,
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
        
        setData('items', newItems);

        // Auto-fetch price from backend
        if ((field === 'product_id' || field === 'quantity') && data.vendor_id) {
            const productId = field === 'product_id' ? Number(value) : newItems[index].product_id;
            const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;

            if (productId) {
                axios.get('/purchasing/pricelists/get-price', {
                    params: {
                        vendor_id: data.vendor_id,
                        product_id: productId,
                        quantity: quantity
                    }
                })
                .then(response => {
                    setData(currentData => {
                        const updatedItems = [...currentData.items];
                        // Verify the item is still the same product (prevent race conditions)
                        if (updatedItems[index] && updatedItems[index].product_id === productId) {
                            updatedItems[index].unit_price = response.data.price;
                        }
                        return { ...currentData, items: updatedItems };
                    });
                })
                .catch(error => {
                    console.error('Failed to fetch price:', error);
                });
            }
        }
    };

    const calculateSubtotal = (item: PurchaseOrderItem) => {
        return item.quantity * item.unit_price;
    };

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
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
            { title: 'Purchase Orders', href: index.url() },
            { title: isEditing ? order.document_number : 'New PO', href: '#' }
        ]}>
            <Head title={isEditing ? `Edit ${order.document_number}` : "New Purchase Order"} />
            
            <form onSubmit={submit} className="container mx-auto space-y-6">
                <div>
                     <Button variant="ghost" asChild className="mb-2 pl-0 hover:pl-2 transition-all">
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Purchase Orders
                        </Link>
                    </Button>

                    <PageHeader
                        title={isEditing ? `Edit ${order.document_number}` : 'Create Purchase Order'}
                        description={isEditing ? 'Update purchase order details' : 'Fill in the details for your new purchase order.'}
                    >
                         <div className="flex gap-2">
                             <Button type="button" variant="outline" asChild>
                                <Link href={index.url()}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : (isEditing ? 'Update' : 'Create Order')}
                            </Button>
                        </div>
                    </PageHeader>
                </div>
                
                {/* Header Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                        <CardDescription>
                            General information about the transaction
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
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

                        <div className="grid grid-cols-2 gap-6">
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
                            <div className="space-y-2">
                                <Label htmlFor="payment_term_id">Payment Terms</Label>
                                <Select 
                                    value={data.payment_term_id} 
                                    onValueChange={(value) => setData('payment_term_id', value)}
                                >
                                    <SelectTrigger id="payment_term_id">
                                        <SelectValue placeholder="Select payment terms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentTerms?.map((term) => (
                                            <SelectItem key={term.id} value={String(term.id)}>
                                                {term.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.payment_term_id} />
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
                                <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-muted/20">
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
                                            className="bg-muted text-right font-mono"
                                        />
                                    </div>

                                    <div className="col-span-1 flex items-end h-[62px] pb-[2px]">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Total with Tax Breakdown */}
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
                                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span className="font-mono">{formatCurrency(taxCalc.total)}</span>
                                    </div>
                                    {data.withholding_tax_rate > 0 && (
                                        <>
                                            <div className="flex justify-between text-sm text-red-600">
                                                <span>PPh 23 {data.withholding_tax_rate}%:</span>
                                                <span className="font-mono">-{formatCurrency(taxCalc.withholdingAmount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center font-semibold text-primary border-t pt-2">
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
                        <CardDescription>Configure tax rates for this purchase order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
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
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="tax_inclusive"
                                checked={data.tax_inclusive}
                                onCheckedChange={(checked) => setData('tax_inclusive', checked as boolean)}
                            />
                            <Label htmlFor="tax_inclusive" className="font-normal cursor-pointer">
                                Tax Inclusive (item prices already include tax)
                            </Label>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </AppLayout>
    );
}
