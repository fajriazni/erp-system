import React, { FormEvent } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ArrowLeft, FileText, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { index as billsIndex, store, update } from '@/routes/accounting/bills';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/ui/page-header';

interface Product {
    id: number;
    name: string;
    code: string;
}

interface Props {
    bill?: any;
    vendors: { id: number; company_name: string; name: string }[];
    products: Product[];
    purchaseOrder?: any;
    paymentSchedule?: any[];
}

export default function VendorBillForm({ bill, vendors, products, purchaseOrder, paymentSchedule = [] }: Props) {
    const isEditing = !!bill;

    const { data, setData, post, processing, errors } = useForm<{
        _method?: string;
        purchase_order_id?: number | string;
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
        tax_rate: number;
        withholding_tax_rate: number;
        tax_inclusive: boolean;
    }>({
        _method: isEditing ? 'PUT' : undefined,
        purchase_order_id: purchaseOrder?.id || bill?.purchase_order_id || '',
        vendor_id: bill?.vendor_id || purchaseOrder?.vendor_id || '',
        reference_number: bill?.reference_number || '',
        date: bill?.date || new Date().toISOString().split('T')[0],
        due_date: bill?.due_date || '',
        notes: bill?.notes || '',
        items: bill?.items?.map((item: any) => ({
            id: item.id,
            product_id: item.product_id || '',
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
        })) || purchaseOrder?.items?.map((item: any) => ({
            product_id: item.product_id,
            description: item.description || item.product.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })) || [{ product_id: '', description: '', quantity: 1, unit_price: 0 }],
        attachment: null,
        tax_rate: (bill as any)?.tax_rate ?? (purchaseOrder as any)?.tax_rate ?? 11,
        withholding_tax_rate: (bill as any)?.withholding_tax_rate ?? (purchaseOrder as any)?.withholding_tax_rate ?? 0,
        tax_inclusive: (bill as any)?.tax_inclusive ?? (purchaseOrder as any)?.tax_inclusive ?? false,
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
        const po = purchaseOrder || (bill as any)?.purchase_order;
        const poTotal = po?.total ?? 0;
        const targetAmount = item.status === 'partial' ? (item.remaining_amount ?? 0) : item.amount;
        
        let ratio = 1;
        if (poTotal > 0) {
            ratio = targetAmount / poTotal;
        }

        const poItems = po?.items;
        let newItems = [];
        
        if (poItems) {
            newItems = poItems.map((poItem: any) => ({
                product_id: poItem.product_id,
                description: poItem.description || poItem.product?.name,
                quantity: poItem.quantity,
                unit_price: poItem.unit_price * ratio
            }));
        } else {
             newItems = [{
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
            tax_rate: po?.tax_rate ?? 11,
            withholding_tax_rate: po?.withholding_tax_rate ?? 0,
        }));
        toast.success(`Applied schedule: ${item.description}. Items prorated (${(ratio * 100).toFixed(1)}%).`);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => toast.success(`Vendor bill ${isEditing ? 'updated' : 'created'} successfully.`),
            onError: (errors: any) => {
                toast.error('Please check the form for errors.');
                if (errors.items) toast.error(errors.items);
            },
            preserveScroll: true,
        };

        if (isEditing) {
            // Use post with _method: PUT for file upload support in Inertia
            post(update.url(bill.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <React.Fragment>
            <PageHeader
                title={isEditing ? `Edit Bill ${bill.bill_number}` : 'Create Vendor Bill'}
                description={isEditing ? 'Update invoice details.' : 'Enter the invoice details received from the vendor.'}
            >
                <Button variant="outline" asChild>
                    <Link href={billsIndex.url()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>
            </PageHeader>

            {(purchaseOrder || (bill && bill.purchase_order_id)) && paymentSchedule && paymentSchedule.length > 0 && (
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

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Bill Information</CardTitle>
                        <CardDescription>General information about the bill.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="items">Items & Tax</TabsTrigger>
                                <TabsTrigger value="notes">Notes & Attachments</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="details" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vendor_id">Vendor <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={data.vendor_id ? String(data.vendor_id) : ''}
                                            onValueChange={(value) => setData('vendor_id', parseInt(value))}
                                            disabled={!!purchaseOrder || !!bill?.purchase_order_id}
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
                            </TabsContent>

                            <TabsContent value="items" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">Line Items</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Item
                                        </Button>
                                    </div>
                                    
                                    {data.items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
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
                                                {/* @ts-ignore */}
                                                <InputError message={errors[`items.${index}.description`]} />
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
                                                  <InputError message={errors[`items.${index}.quantity`]} />
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
                                                 <InputError message={errors[`items.${index}.unit_price`]} />
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
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-medium mb-4">Tax Configuration</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Checkbox
                                            id="tax_inclusive"
                                            checked={data.tax_inclusive}
                                            onCheckedChange={(checked) => setData('tax_inclusive', checked as boolean)}
                                        />
                                        <Label htmlFor="tax_inclusive" className="font-normal cursor-pointer">
                                            Tax Inclusive (prices already include tax)
                                        </Label>
                                    </div>
                                    
                                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
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
                                        <div className="flex justify-between font-bold text-lg border-t pt-2 border-border">
                                            <span>Total:</span>
                                            <span className="font-mono">{formatCurrency(taxCalc.total)}</span>
                                        </div>
                                        {data.withholding_tax_rate > 0 && (
                                            <>
                                                <div className="flex justify-between text-sm text-red-600">
                                                    <span>PPh 23 {data.withholding_tax_rate}%:</span>
                                                    <span className="font-mono">-{formatCurrency(taxCalc.withholdingAmount)}</span>
                                                </div>
                                                <div className="flex justify-between font-semibold text-primary border-t pt-2 border-border">
                                                    <span>Net Payable:</span>
                                                    <span className="font-mono">{formatCurrency(taxCalc.netPayable)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="notes" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Additional notes..."
                                        rows={4}
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attachment">Invoice Attachment</Label>
                                    {bill?.attachment_path && (
                                        <div className="mb-2 text-sm flex items-center text-blue-600 bg-blue-50 p-2 rounded">
                                            <FileText className="h-4 w-4 mr-2" />
                                            <span>Current attachment exists</span>
                                        </div>
                                    )}
                                    <Input
                                        id="attachment"
                                        type="file"
                                        onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">Upload PDF, JPG, PNG, DOC (Max 10MB)</p>
                                    <InputError message={errors.attachment} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t px-6 pt-5">
                        <Button type="button" variant="outline" asChild>
                            <Link href={billsIndex.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {processing ? 'Saving...' : (isEditing ? 'Update Bill' : 'Create Bill')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </React.Fragment>
    );
}
